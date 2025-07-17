// Fetch and analyze the CSV file to understand the data structure
async function analyzeCsvData() {
  try {
    console.log("Fetching CSV file...")
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2025-07-17T15_22_53.744Z%20Spallina%20Work%20Space%20-%20Spallina%20-%20Bloomfield-wvZnZxXylbbnZPSB6C1oGmGzuXsxiu.csv",
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    console.log("CSV file fetched successfully")
    console.log("File size:", csvText.length, "characters")

    // Split into lines and analyze
    const lines = csvText.split("\n")
    console.log("Total lines:", lines.length)

    // Show headers
    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())
    console.log("\nHeaders found:")
    headers.forEach((header, index) => {
      console.log(`${index + 1}. "${header}"`)
    })

    // Analyze first few data rows
    console.log("\nFirst 3 data rows:")
    for (let i = 1; i <= Math.min(3, lines.length - 1); i++) {
      if (lines[i].trim()) {
        console.log(`\nRow ${i}:`)
        const values = lines[i].split(",")
        headers.forEach((header, index) => {
          if (values[index]) {
            console.log(`  ${header}: ${values[index].replace(/"/g, "").trim()}`)
          }
        })
      }
    }

    // Look for driver assignment patterns
    console.log("\nAnalyzing driver assignment patterns...")
    const driverLabelsIndex = headers.findIndex((h) => h.includes("Drivers Assigned (labels)"))
    const driverTextIndex = headers.findIndex((h) => h.includes("Drivers Assigned (short text)"))

    console.log("Driver columns found:")
    console.log(`  Drivers Assigned (labels) at index: ${driverLabelsIndex}`)
    console.log(`  Drivers Assigned (short text) at index: ${driverTextIndex}`)

    // Sample driver data
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(",")
        const labelsValue = driverLabelsIndex >= 0 ? values[driverLabelsIndex]?.replace(/"/g, "").trim() : ""
        const textValue = driverTextIndex >= 0 ? values[driverTextIndex]?.replace(/"/g, "").trim() : ""

        console.log(`Row ${i} drivers:`)
        console.log(`  Labels: "${labelsValue}"`)
        console.log(`  Text: "${textValue}"`)
      }
    }

    // Check timing columns
    const minutesBeforeIndex = headers.findIndex((h) => h.includes("Minutes Before Shift"))
    const intervalIndex = headers.findIndex((h) => h.includes("Interval Between Trucks"))
    const dueDateIndex = headers.findIndex((h) => h.includes("Due Date"))

    console.log("\nTiming columns:")
    console.log(`  Minutes Before Shift at index: ${minutesBeforeIndex}`)
    console.log(`  Interval Between Trucks at index: ${intervalIndex}`)
    console.log(`  Due Date at index: ${dueDateIndex}`)

    // Sample timing data
    for (let i = 1; i <= Math.min(3, lines.length - 1); i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(",")
        const minutesBefore = minutesBeforeIndex >= 0 ? values[minutesBeforeIndex]?.replace(/"/g, "").trim() : ""
        const interval = intervalIndex >= 0 ? values[intervalIndex]?.replace(/"/g, "").trim() : ""
        const dueDate = dueDateIndex >= 0 ? values[dueDateIndex]?.replace(/"/g, "").trim() : ""

        console.log(`Row ${i} timing:`)
        console.log(`  Minutes Before: "${minutesBefore}"`)
        console.log(`  Interval: "${interval}"`)
        console.log(`  Due Date: "${dueDate}"`)
      }
    }
  } catch (error) {
    console.error("Error analyzing CSV:", error)
  }
}

// Run the analysis
analyzeCsvData()
