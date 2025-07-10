// This is to compute NDVI, LST, UTFVI, and UHI from Landsat.

// 1) ADDIS ABABA ##########################################################################################
//         #################################################################################################
// INPUTS` ***************************************************************************************************
// AOI
var aoi1 = ee.FeatureCollection(addis)

// Set stard and end date of the Image
var startDate = '2024-01-01'
var endDate = '2024-05-31'


// Create a function that applies scaling factors.
function applyScaleFactors(image) {
var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
return image.addBands(opticalBands, null, true).addBands(thermalBands, null, true);
}

// Create a function that masks clouds and cloud-shadows out.
function maskL8sr(col) {
// Bits 3 and 5 are cloud shadow and cloud, respectively.
var cloudShadowBitMask = (1 << 3);
var cloudsBitMask = (1 << 5);
// Get the pixel QA band.
var qa = col.select('QA_PIXEL');
// Both flags should be set to zero, indicating clear conditions.
var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
             .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
return col.updateMask(mask);
}

// Filter the collection, first by the aoi, and then by date.
var image = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
.filterDate(startDate, endDate)
.filterBounds(aoi1)
.map(applyScaleFactors) // applies scale factoring.
.map(maskL8sr)         // filters clouds and shadows.
.median();

var visualization = {
bands: ['SR_B4', 'SR_B3', 'SR_B2'],
min: 0.0,
max: 0.3,
};

Map.addLayer(image, visualization, 'True Color (432)', false);
Map.centerObject(aoi1)

// NDVI   *************************************************************************************************
var ndvi  = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI')
Map.addLayer(ndvi, {min:-1, max:1, palette: ['blue', 'white', 'green']}, 'ndvi', false)

// ndvi statistics
var ndvi_min = ee.Number(ndvi.reduceRegion({
reducer: ee.Reducer.min(),
geometry: aoi1,
scale: 30,
maxPixels: 1e9
}).values().get(0))

var ndvi_max = ee.Number(ndvi.reduceRegion({
reducer: ee.Reducer.max(),
geometry: aoi1,
scale: 30,
maxPixels: 1e9
}).values().get(0))


// fraction of veg
var fv = (ndvi.subtract(ndvi_min).divide(ndvi_max.subtract(ndvi_min))).pow(ee.Number(2))
      .rename('FV')
      
// Export the NDVI map
Export.image.toDrive({
  image: ndvi,
  description: 'Addis_NDVI_2024',
  scale: 100, // Set the defined scale
  region: aoi1
  });


// LST  *************************************************************************************************
var em = fv.multiply(ee.Number(0.004)).add(ee.Number(0.986)).rename('EM') // thei is emissivity

var thermal = image.select('ST_B10').rename('thermal')

var lst = thermal.expression(
'(tb / (1 + (0.00115 * (tb/0.48359547432)) * log(em))) - 273.15',
{'tb':thermal.select('thermal'),
'em': em}).rename('LST')

var lst_vis = {
min: 25,
max: 50,
palette: [
'040274', '040281', '0502a3', '0502b8', '0502ce', '0502e6',
'0602ff', '235cb1', '307ef3', '269db1', '30c8e2', '32d3ef',
'3be285', '3ff38f', '86e26f', '3ae237', 'b5e22e', 'd6e21f',
'fff705', 'ffd611', 'ffb613', 'ff8b13', 'ff6e08', 'ff500d',
'ff0000', 'de0101', 'c21301', 'a71001', '911003']
}

Map.addLayer(lst, lst_vis, 'LST AOI')
Map.centerObject(aoi1, 10)

// Export the LST map
Export.image.toDrive({
  image: thermal,
  description: 'Addis_LST_2024',
  scale: 100, // Set the defined scale
  region: aoi1
  });

// Urban Heat Island *************************************************************************************

//1. Normalized UHI

var lst_mean = ee.Number(lst.reduceRegion({
reducer: ee.Reducer.mean(),
geometry: aoi1,
scale: 30,
maxPixels: 1e9
}).values().get(0))


var lst_std = ee.Number(lst.reduceRegion({
reducer: ee.Reducer.stdDev(),
geometry: aoi1,
scale: 30,
maxPixels: 1e9
}).values().get(0))

print('Addis Mean LST', lst_mean)
print('Addis STD LST', lst_std)

var uhi = lst.subtract(lst_mean).divide(lst_std).rename('UHI')

var uhi_vis = {
min: -4,
max: 4,
palette:['313695', '74add1', 'fed976', 'feb24c', 'fd8d3c', 'fc4e2a', 'e31a1c',
'b10026']
}
Map.addLayer(uhi, uhi_vis, 'UHI AOI')

// Export the UHI map
Export.image.toDrive({
  image: uhi,
  description: 'Addis_UHI_2024',
  scale: 100, // Set the defined scale
  region: aoi1
  });

// Urban Thermal Field variance Index (UTFVI) ***********************************************
var utfvi = lst.subtract(lst_mean).divide(lst).rename('UTFVI')
var utfvi_vis = {
min: -1,
max: 0.3,
palette:['313695', '74add1', 'fed976', 'feb24c', 'fd8d3c', 'fc4e2a', 'e31a1c',
'b10026']
}
Map.addLayer(utfvi, utfvi_vis, 'UTFVI AOI')

// Export the UTFVI map
Export.image.toDrive({
  image: utfvi,
  description: 'Addis_UTFVI_2024',
  scale: 100, // Set the defined scale
  region: aoi1
  });
// ********************************************************************************************************





// 2) LAGOS #################################################################################################
//          #################################################################################################
// INPUTS` ***************************************************************************************************
// AOI
var aoi2 = ee.FeatureCollection(lagos)

// Set stard and end date of the Image
// var startDate = '2024-05-01'
// var endDate = '2024-05-31'

// Create a function that applies scaling factors.
function applyScaleFactors(image) {
var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
return image.addBands(opticalBands, null, true).addBands(thermalBands, null, true);
}

// Create a function that masks clouds and cloud-shadows out.
function maskL8sr(col) {
// Bits 3 and 5 are cloud shadow and cloud, respectively.
var cloudShadowBitMask = (1 << 3);
var cloudsBitMask = (1 << 5);
// Get the pixel QA band.
var qa = col.select('QA_PIXEL');
// Both flags should be set to zero, indicating clear conditions.
var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
             .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
return col.updateMask(mask);
}

// Filter the collection, first by the aoi, and then by date.
var image = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
.filterDate(startDate, endDate)
.filterBounds(aoi2)
.map(applyScaleFactors) // applies scale factoring.
.map(maskL8sr)         // filters clouds and shadows.
.median();

var visualization = {
bands: ['SR_B4', 'SR_B3', 'SR_B2'],
min: 0.0,
max: 0.3,
};

Map.addLayer(image, visualization, 'True Color (432)', false);
Map.centerObject(aoi2)

// NDVI   *************************************************************************************************
var ndvi  = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI')
Map.addLayer(ndvi, {min:-1, max:1, palette: ['blue', 'white', 'green']}, 'ndvi', false)

// ndvi statistics
var ndvi_min = ee.Number(ndvi.reduceRegion({
reducer: ee.Reducer.min(),
geometry: aoi2,
scale: 30,
maxPixels: 1e9
}).values().get(0))

var ndvi_max = ee.Number(ndvi.reduceRegion({
reducer: ee.Reducer.max(),
geometry: aoi2,
scale: 30,
maxPixels: 1e9
}).values().get(0))

// fraction of veg
var fv = (ndvi.subtract(ndvi_min).divide(ndvi_max.subtract(ndvi_min))).pow(ee.Number(2))
      .rename('FV')
      
// Exporting the NDVI map
Export.image.toDrive({
  image: ndvi,
  description: 'Lagos_NDVI_2024',
  scale: 100, // Set the defined scale
  region: aoi2
  });

// LST  *************************************************************************************************
var em = fv.multiply(ee.Number(0.004)).add(ee.Number(0.986)).rename('EM') // thei is emissivity
var thermal = image.select('ST_B10').rename('thermal')
var lst = thermal.expression(
'(tb / (1 + (0.00115 * (tb/0.48359547432)) * log(em))) - 273.15',
{'tb':thermal.select('thermal'),
'em': em}).rename('LST')

// Set visualization parameters
var lst_vis = {
min: 25,
max: 50,
palette: [
'040274', '040281', '0502a3', '0502b8', '0502ce', '0502e6',
'0602ff', '235cb1', '307ef3', '269db1', '30c8e2', '32d3ef',
'3be285', '3ff38f', '86e26f', '3ae237', 'b5e22e', 'd6e21f',
'fff705', 'ffd611', 'ffb613', 'ff8b13', 'ff6e08', 'ff500d',
'ff0000', 'de0101', 'c21301', 'a71001', '911003']
}

Map.addLayer(lst, lst_vis, 'LST AOI')
Map.centerObject(aoi2, 10)

// Export the LST map
Export.image.toDrive({
  image: thermal,
  description: 'Lagos_LST_2024',
  scale: 100, // Set the defined scale
  region: aoi2
  });

// Urban Heat Island *************************************************************************************
//1. Normalized UHI
var lst_mean = ee.Number(lst.reduceRegion({
reducer: ee.Reducer.mean(),
geometry: aoi2,
scale: 30,
maxPixels: 1e9
}).values().get(0))

var lst_std = ee.Number(lst.reduceRegion({
reducer: ee.Reducer.stdDev(),
geometry: aoi2,
scale: 30,
maxPixels: 1e9
}).values().get(0))

print('Lagos Mean LST', lst_mean)
print('Lagos STD LST', lst_std)

var uhi = lst.subtract(lst_mean).divide(lst_std).rename('UHI')
var uhi_vis = {
min: -4,
max: 4,
palette:['313695', '74add1', 'fed976', 'feb24c', 'fd8d3c', 'fc4e2a', 'e31a1c',
'b10026']
}
Map.addLayer(uhi, uhi_vis, 'UHI AOI')

// Export the UHI map
Export.image.toDrive({
  image: uhi,
  description: 'Lagos_UHI_2024',
  scale: 100, // Set the defined scale
  region: aoi2
  });

// Urban Thermal Field variance Index (UTFVI) **************************************************************
var utfvi = lst.subtract(lst_mean).divide(lst).rename('UTFVI')
var utfvi_vis = {
min: -1,
max: 0.3,
palette:['313695', '74add1', 'fed976', 'feb24c', 'fd8d3c', 'fc4e2a', 'e31a1c',
'b10026']
}
Map.addLayer(utfvi, utfvi_vis, 'UTFVI AOI')

// Export the UTFVI map
Export.image.toDrive({
  image: utfvi,
  description: 'Lagos_UTFVI_2024',
  scale: 100, // Set the defined scale
  region: aoi2
  });
// ********************************************************************************************************


// 3) JOHANNESBURG ##########################################################################################
//          #################################################################################################
// INPUTS` ***************************************************************************************************
// AOI
var aoi3 = ee.FeatureCollection(jburg)

// Set stard and end date of the Image
// var startDate = '2024-05-01'
// var endDate = '2024-05-31'

// Create a function that applies scaling factors.
function applyScaleFactors(image) {
var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
return image.addBands(opticalBands, null, true).addBands(thermalBands, null, true);
}

// Create a function that masks clouds and cloud-shadows out.
function maskL8sr(col) {
// Bits 3 and 5 are cloud shadow and cloud, respectively.
var cloudShadowBitMask = (1 << 3);
var cloudsBitMask = (1 << 5);
// Get the pixel QA band.
var qa = col.select('QA_PIXEL');
// Both flags should be set to zero, indicating clear conditions.
var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
             .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
return col.updateMask(mask);
}

// Filter the collection, first by the aoi, and then by date.
var image = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
.filterDate(startDate, endDate)
.filterBounds(aoi3)
.map(applyScaleFactors) // applies scale factoring.
.map(maskL8sr)         // filters clouds and shadows.
.median();

var visualization = {
bands: ['SR_B4', 'SR_B3', 'SR_B2'],
min: 0.0,
max: 0.3,
};

Map.addLayer(image, visualization, 'True Color (432)', false);
Map.centerObject(aoi3)

// NDVI   *************************************************************************************************
var ndvi  = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI')
Map.addLayer(ndvi, {min:-1, max:1, palette: ['blue', 'white', 'green']}, 'ndvi', false)

// ndvi statistics
var ndvi_min = ee.Number(ndvi.reduceRegion({
reducer: ee.Reducer.min(),
geometry: aoi3,
scale: 30,
maxPixels: 1e9
}).values().get(0))

var ndvi_max = ee.Number(ndvi.reduceRegion({
reducer: ee.Reducer.max(),
geometry: aoi3,
scale: 30,
maxPixels: 1e9
}).values().get(0))

// fraction of veg
var fv = (ndvi.subtract(ndvi_min).divide(ndvi_max.subtract(ndvi_min))).pow(ee.Number(2))
      .rename('FV')
      
// Export the NDVI map
Export.image.toDrive({
  image: ndvi,
  description: 'Jburg_NDVI_2024',
  scale: 100, // Set the defined scale
  region: aoi3
  });

// LST  *************************************************************************************************
var em = fv.multiply(ee.Number(0.004)).add(ee.Number(0.986)).rename('EM') // thei is emissivity
var thermal = image.select('ST_B10').rename('thermal')
var lst = thermal.expression(
'(tb / (1 + (0.00115 * (tb/0.48359547432)) * log(em))) - 273.15',
{'tb':thermal.select('thermal'),
'em': em}).rename('LST')

// Set visualization parameters
var lst_vis = {
min: 25,
max: 50,
palette: [
'040274', '040281', '0502a3', '0502b8', '0502ce', '0502e6',
'0602ff', '235cb1', '307ef3', '269db1', '30c8e2', '32d3ef',
'3be285', '3ff38f', '86e26f', '3ae237', 'b5e22e', 'd6e21f',
'fff705', 'ffd611', 'ffb613', 'ff8b13', 'ff6e08', 'ff500d',
'ff0000', 'de0101', 'c21301', 'a71001', '911003']
}

Map.addLayer(lst, lst_vis, 'LST AOI')
Map.centerObject(aoi3, 10)

// Export the LST map
Export.image.toDrive({
  image: thermal,
  description: 'Jburg_LST_2024',
  scale: 100, // Set the defined scale
  region: aoi3
  });

// Urban Heat Island *************************************************************************************
//1. Normalized UHI

var lst_mean = ee.Number(lst.reduceRegion({
reducer: ee.Reducer.mean(),
geometry: aoi3,
scale: 30,
maxPixels: 1e9
}).values().get(0))

var lst_std = ee.Number(lst.reduceRegion({
reducer: ee.Reducer.stdDev(),
geometry: aoi3,
scale: 30,
maxPixels: 1e9
}).values().get(0))

print('Jburg Mean LST', lst_mean)
print('Jburg STD LST', lst_std)

var uhi = lst.subtract(lst_mean).divide(lst_std).rename('UHI')
var uhi_vis = {
min: -4,
max: 4,
palette:['313695', '74add1', 'fed976', 'feb24c', 'fd8d3c', 'fc4e2a', 'e31a1c',
'b10026']
}
Map.addLayer(uhi, uhi_vis, 'UHI AOI')

// Export the UHI map
Export.image.toDrive({
  image: uhi,
  description: 'Jburg_UHI_2024',
  scale: 100, // Set the defined scale
  region: aoi3
  });

// Urban Thermal Field variance Index (UTFVI) **************************************************************
var utfvi = lst.subtract(lst_mean).divide(lst).rename('UTFVI')
var utfvi_vis = {
min: -1,
max: 0.3,
palette:['313695', '74add1', 'fed976', 'feb24c', 'fd8d3c', 'fc4e2a', 'e31a1c',
'b10026']
}
Map.addLayer(utfvi, utfvi_vis, 'UTFVI AOI')

// Export the UTFVI map
Export.image.toDrive({
  image: utfvi,
  description: 'Jburg_UTFVI_2024',
  scale: 100, // Set the defined scale
  region: aoi3
  });
// ############################################## THE END ###################################################
// ############################################## THE END ###################################################