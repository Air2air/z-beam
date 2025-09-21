machineSettings:
  settings:
  - header: '## Laser System Configuration'
    rows:
    - parameter: Power Range
      value: 50-200W
      range: 20W - 500W
      category: Laser Power
    - parameter: Wavelength
      value: 1064nm (primary), 532nm (optional)
      range: 355nm - 2940nm
      category: Optical
    - parameter: Pulse Duration
      value: 10-50ns
      range: 1ns - 1000ns
      category: Temporal
    - parameter: Repetition Rate
      value: 20-100kHz
      range: 1kHz - 1000kHz
      category: Timing
  - header: '## Processing Parameters'
    rows:
    - parameter: Fluence Range
      value: 1.0–10 J/cm²
      range: 0.1J/cm² - 50J/cm²
      category: Energy Density
    - parameter: Spot Size
      value: 0.5-3.0mm
      range: 0.01mm - 10mm
      category: Beam Geometry
renderInstructions: In Next.js, loop over settings[].rows and render as <table> with <tr><td>{parameter}</td><td>{value} ({unit})</td><td>{range}</td><td>{category}</td></tr>. Use MDX for headers. Pure data structure optimized for performance.
