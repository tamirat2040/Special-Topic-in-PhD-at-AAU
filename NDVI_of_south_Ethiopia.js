// Fix the study area - Ethiopia
var roi = ee.FeatureCollection(table2)

// NDVI of Ethiopia 2000
// ###########################################################################################
// ###########################################################################################

// Set stard and end date of the Image
var startDate2 = '2000-01-01'
var endDate2 = '2000-12-31'

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
var image = ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
.filterDate(startDate2, endDate2)
.filterBounds(roi)
.map(applyScaleFactors) // applies scale factoring.
.map(maskL8sr)         // filters clouds and shadows.
.median();

var visualization = {
bands: ['SR_B4', 'SR_B3'],
min: 0.0,
max: 0.3,
};

Map.addLayer(image, visualization, 'True Color (432)', false);
Map.centerObject(roi)

// NDVI   *************************************************************************************************
var ndvi2  = image.normalizedDifference(['SR_B4', 'SR_B3']).rename('NDVI')
Map.addLayer(ndvi2, {min:-1, max:1, palette: ['blue', 'white', 'green']}, 'ndvi', false)

// ndvi min-max
var ndvi_min2 = ee.Number(ndvi2.reduceRegion({
reducer: ee.Reducer.min(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))

var ndvi_max2 = ee.Number(ndvi2.reduceRegion({
reducer: ee.Reducer.max(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))

// fraction of veg
var fv = (ndvi2.subtract(ndvi_min2).divide(ndvi_max2.subtract(ndvi_min2))).pow(ee.Number(2))
      .rename('FV')

// Calculate NDVI statistics
var ndviStats2 = ndvi2.reduceRegion({
  reducer: ee.Reducer.mean().combine({
    reducer2: ee.Reducer.minMax(),
    sharedInputs: true
  }),
  geometry: roi,
  scale: 30, // Adjust scale as needed
  maxPixels: 1e9
});
var ndvi_med3 = ee.Number(ndvi2.reduceRegion({
reducer: ee.Reducer.median(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))

// Print NDVI statistics to the console
print('South Ethiopia NDVI Statistics 2000:', ndviStats2);

// Export NDVI statistics to CSV
Export.table.toDrive({
  collection: ee.FeatureCollection([
    ee.Feature(null, ndviStats2)
  ]),
  description: 'South_Eth_NDVI_Stat_2000',
  fileFormat: 'CSV'
});

// Export the NDVI map
Export.image.toDrive({
  image: ndvi2,
  description: 'South_Ethiopia_NDVI_2000',
  scale: 100, // Set the defined scale
  region: roi
  });


// NDVI of Ethiopia 2005
// ###########################################################################################
// ###########################################################################################
// Set stard and end date of the Image
var startDate3 = '2005-01-01'
var endDate3 = '2005-12-31'

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
var image = ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
.filterDate(startDate3, endDate3)
.filterBounds(roi)
.map(applyScaleFactors) // applies scale factoring.
.map(maskL8sr)         // filters clouds and shadows.
.median();

var visualization = {
bands: ['SR_B4', 'SR_B3'],
min: 0.0,
max: 0.3,
};

Map.addLayer(image, visualization, 'True Color (432)', false);
Map.centerObject(roi)

// NDVI   *************************************************************************************************
var ndvi3  = image.normalizedDifference(['SR_B4', 'SR_B3']).rename('NDVI')
Map.addLayer(ndvi3, {min:-1, max:1, palette: ['blue', 'white', 'green']}, 'ndvi', false)

// ndvi statistics
var ndvi_min3 = ee.Number(ndvi3.reduceRegion({
reducer: ee.Reducer.min(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))

var ndvi_max3 = ee.Number(ndvi3.reduceRegion({
reducer: ee.Reducer.max(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))

// fraction of veg
var fv = (ndvi3.subtract(ndvi_min3).divide(ndvi_max3.subtract(ndvi_min3))).pow(ee.Number(2))
      .rename('FV')
      
// Calculate NDVI statistics
var ndviStats3 = ndvi3.reduceRegion({
  reducer: ee.Reducer.mean().combine({
    reducer2: ee.Reducer.minMax(),
    sharedInputs: true
  }),
  geometry: roi,
  scale: 30, // Adjust scale as needed
  maxPixels: 1e9
});
var ndvi_med3 = ee.Number(ndvi3.reduceRegion({
reducer: ee.Reducer.median(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))

// Print NDVI statistics to the console
print('South Ethiopia NDVI Statistics 2005:', ndviStats3);

// Export NDVI statistics to CSV
Export.table.toDrive({
  collection: ee.FeatureCollection([
    ee.Feature(null, ndviStats3)
  ]),
  description: 'South_Eth_NDVI_Stat_2005',
  fileFormat: 'CSV'
});

// Export the NDVI map
Export.image.toDrive({
  image: ndvi3,
  description: 'South_Ethiopia_NDVI_2005',
  scale: 100, // Set the defined scale
  region: roi
  });


// NDVI of Ethiopia 2010
// ###########################################################################################
// ###########################################################################################
// Set stard and end date of the Image
var startDate4 = '2010-01-01'
var endDate4 = '2010-12-31'

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
var image = ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
.filterDate(startDate4, endDate4)
.filterBounds(roi)
.map(applyScaleFactors) // applies scale factoring.
.map(maskL8sr)         // filters clouds and shadows.
.median();

var visualization = {
bands: ['SR_B4', 'SR_B3'],
min: 0.0,
max: 0.3,
};

Map.addLayer(image, visualization, 'True Color (432)', false);
Map.centerObject(roi)

// NDVI   *************************************************************************************************
var ndvi4  = image.normalizedDifference(['SR_B4', 'SR_B3']).rename('NDVI')
Map.addLayer(ndvi4, {min:-1, max:1, palette: ['blue', 'white', 'green']}, 'ndvi', false)

// ndvi statistics
var ndvi_min4 = ee.Number(ndvi4.reduceRegion({
reducer: ee.Reducer.min(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))

var ndvi_max4 = ee.Number(ndvi4.reduceRegion({
reducer: ee.Reducer.max(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))


// fraction of veg
var fv = (ndvi4.subtract(ndvi_min4).divide(ndvi_max4.subtract(ndvi_min4))).pow(ee.Number(2))
      .rename('FV')
      
// Calculate NDVI statistics
var ndviStats4 = ndvi4.reduceRegion({
  reducer: ee.Reducer.mean().combine({
    reducer2: ee.Reducer.minMax(),
    sharedInputs: true
  }),
  geometry: roi,
  scale: 30, // Adjust scale as needed
  maxPixels: 1e9
});
var ndvi_med4 = ee.Number(ndvi4.reduceRegion({
reducer: ee.Reducer.median(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))

// Print NDVI statistics to the console
print('South Ethiopia NDVI Statistics 2010:', ndviStats4);

// Export NDVI statistics to CSV
Export.table.toDrive({
  collection: ee.FeatureCollection([
    ee.Feature(null, ndviStats4)
  ]),
  description: 'South_Eth_NDVI_Stat_2010',
  fileFormat: 'CSV'
});
// Export the NDVI map
Export.image.toDrive({
  image: ndvi4,
  description: 'South_Ethiopia_NDVI_2010',
  scale: 100, // Set the defined scale
  region: roi
  });


// NDVI of Ethiopia 2015
// ###########################################################################################
// ###########################################################################################

// Set stard and end date of the Image
var startDate5 = '2015-01-01'
var endDate5 = '2015-12-31'


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
.filterDate(startDate5, endDate5)
.filterBounds(roi)
.map(applyScaleFactors) // applies scale factoring.
.map(maskL8sr)         // filters clouds and shadows.
.median();

var visualization = {
bands: ['SR_B4', 'SR_B3', 'SR_B2'],
min: 0.0,
max: 0.3,
};

Map.addLayer(image, visualization, 'True Color (432)', false);
Map.centerObject(roi)

// NDVI   *************************************************************************************************
var ndvi5  = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI')
Map.addLayer(ndvi5, {min:-1, max:1, palette: ['blue', 'white', 'green']}, 'ndvi', false)

// ndvi statistics
var ndvi_min5 = ee.Number(ndvi5.reduceRegion({
reducer: ee.Reducer.min(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))

var ndvi_max5 = ee.Number(ndvi5.reduceRegion({
reducer: ee.Reducer.max(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))


// fraction of veg
var fv = (ndvi5.subtract(ndvi_min5).divide(ndvi_max5.subtract(ndvi_min5))).pow(ee.Number(2))
      .rename('FV')
      
// Calculate NDVI statistics
var ndviStats5 = ndvi5.reduceRegion({
  reducer: ee.Reducer.mean().combine({
    reducer2: ee.Reducer.minMax(),
    sharedInputs: true
  }),
  geometry: roi,
  scale: 30, // Adjust scale as needed
  maxPixels: 1e9
});
var ndvi_med5 = ee.Number(ndvi5.reduceRegion({
reducer: ee.Reducer.median(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))

// Print NDVI statistics to the console
print('South Ethiopia NDVI Statistics 2015:', ndviStats5);

// Export NDVI statistics to CSV
Export.table.toDrive({
  collection: ee.FeatureCollection([
    ee.Feature(null, ndviStats5)
  ]),
  description: 'South_Eth_NDVI_Stat_2015',
  fileFormat: 'CSV'
});
// Export the NDVI map
Export.image.toDrive({
  image: ndvi5,
  description: 'South_Ethiopia_NDVI_2015',
  scale: 100, // Set the defined scale
  region: roi
  });
  



// NDVI of Ethiopia 2020
// ###########################################################################################
// ###########################################################################################
// Set stard and end date of the Image
var startDate6 = '2020-01-01'
var endDate6 = '2020-05-31'

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
.filterDate(startDate6, endDate6)
.filterBounds(roi)
.map(applyScaleFactors) // applies scale factoring.
.map(maskL8sr)         // filters clouds and shadows.
.median();

var visualization = {
bands: ['SR_B4', 'SR_B3', 'SR_B2'],
min: 0.0,
max: 0.3,
};

Map.addLayer(image, visualization, 'True Color (432)', false);
Map.centerObject(roi)

// NDVI   *************************************************************************************************
var ndvi6  = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI')
Map.addLayer(ndvi6, {min:-1, max:1, palette: ['blue', 'white', 'green']}, 'ndvi', false)

// ndvi statistics
var ndvi_min6 = ee.Number(ndvi6.reduceRegion({
reducer: ee.Reducer.min(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))

var ndvi_max6 = ee.Number(ndvi6.reduceRegion({
reducer: ee.Reducer.max(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))



// fraction of veg
var fv = (ndvi6.subtract(ndvi_min6).divide(ndvi_max6.subtract(ndvi_min6))).pow(ee.Number(2))
      .rename('FV')
      
// Calculate NDVI statistics
var ndviStats6 = ndvi6.reduceRegion({
  reducer: ee.Reducer.mean().combine({
    reducer2: ee.Reducer.minMax(),
    sharedInputs: true
  }),
  geometry: roi,
  scale: 30, // Adjust scale as needed
  maxPixels: 1e9
});
var ndvi_med6 = ee.Number(ndvi6.reduceRegion({
reducer: ee.Reducer.median(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))

// Print NDVI statistics to the console
print('2South Ethiopia NDVI Statistics 2020:', ndviStats6);

// Export NDVI statistics to CSV
Export.table.toDrive({
  collection: ee.FeatureCollection([
    ee.Feature(null, ndviStats6)
  ]),
  description: 'South_Eth_NDVI_Stat_2020',
  fileFormat: 'CSV'
});

// Export the NDVI map
Export.image.toDrive({
  image: ndvi6,
  description: 'South_Ethiopia_NDVI_2020',
  scale: 100, // Set the defined scale
  region: roi
  });




// NDVI of Ethiopia 2024
// ###########################################################################################
// ###########################################################################################
// Set stard and end date of the Image
var startDate7 = '2024-01-01'
var endDate7 = '2024-05-31'

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
.filterDate(startDate7, endDate7)
.filterBounds(roi)
.map(applyScaleFactors) // applies scale factoring.
.map(maskL8sr)         // filters clouds and shadows.
.median();

var visualization = {
bands: ['SR_B4', 'SR_B3', 'SR_B2'],
min: 0.0,
max: 0.3,
};

Map.addLayer(image, visualization, 'True Color (432)', false);
Map.centerObject(roi)

// NDVI   *************************************************************************************************
var ndvi7  = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI')
Map.addLayer(ndvi7, {min:-1, max:1, palette: ['blue', 'white', 'green']}, 'ndvi', false)

// ndvi statistics
var ndvi_min7 = ee.Number(ndvi7.reduceRegion({
reducer: ee.Reducer.min(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))

var ndvi_max7 = ee.Number(ndvi7.reduceRegion({
reducer: ee.Reducer.max(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))

// fraction of veg
var fv = (ndvi7.subtract(ndvi_min7).divide(ndvi_max7.subtract(ndvi_min7))).pow(ee.Number(2))
      .rename('FV')
      
// Calculate NDVI statistics
var ndviStats7 = ndvi7.reduceRegion({
  reducer: ee.Reducer.mean().combine({
    reducer2: ee.Reducer.minMax(),
    sharedInputs: true
  }),
  geometry: roi,
  scale: 30, // Adjust scale as needed
  maxPixels: 1e9
});
var ndvi_med7 = ee.Number(ndvi7.reduceRegion({
reducer: ee.Reducer.median(),
geometry: roi,
scale: 30,
maxPixels: 1e9
}).values().get(0))

// Print NDVI statistics to the console
print('South Ethiopia NDVI Statistics 2024:', ndviStats7);

// Export NDVI statistics to CSV
Export.table.toDrive({
  collection: ee.FeatureCollection([
    ee.Feature(null, ndviStats7)
  ]),
  description: 'South_Eth_NDVI_Stat_2024',
  fileFormat: 'CSV'
});

// Export the NDVI map
Export.image.toDrive({
  image: ndvi7,
  description: 'South_Ethiopia_NDVI_2024',
  scale: 100, // Set the defined scale
  region: roi
  });

  
// ######################################## THE END OF CODE ###################################################
// ######################################## THE END OF CODE ###################################################