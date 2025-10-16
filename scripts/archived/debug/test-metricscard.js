const http = require('http');

http.get('http://localhost:3000/api/articles/porcelain-laser-cleaning', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const components = json.components || {};
      console.log('Components found:', Object.keys(components));
      if ('metricsmachinesettings' in components) {
        console.log('✅ MetricsMachineSettings component loaded successfully!');
        console.log('MetricsMachineSettings config:', JSON.stringify(components.metricsmachinesettings.config, null, 2));
      } else {
        console.log('❌ MetricsMachineSettings component NOT found');
        console.log('Available components:', Object.keys(components));
      }
    } catch(e) {
      console.log('Error:', e.message);
      console.log('Raw response (first 200 chars):', data.substring(0, 200));
    }
  });
}).on('error', err => console.log('Request error:', err.message));