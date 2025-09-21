machineSettings:
  settings:
  - header: '## Laser System Configuration'
    rows:
    - parameter: Wavelength
      value: 1064nm (primary), 532nm (optional)
      range: 355nm - 2940nm
      category: Optical
    - parameter: Pulse Duration
      value: 1-50ns
      range: 1ns - 1000ns
      category: Temporal
  - header: '## Processing Parameters'
    rows:
    - parameter: Fluence Range
      value: 0.1-1.0 J/cm²
      range: 0.1J/cm² - 50J/cm²
      category: Energy Density
renderInstructions: In Next.js, loop over settings[].rows and render as <table> with <tr><td>{parameter}</td><td>{value} ({unit})</td><td>{range}</td><td>{category}</td></tr>. Use MDX for headers. Pure data structure optimized for performance.
