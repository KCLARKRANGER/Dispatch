interface ReportData {
  date: string
  createdBy: string
  createdAt: string
  totalEntries: number
  slingers: TruckEntry[]
  dumpTrucks: TruckEntry[]
  tractors: TruckEntry[]
  asphaltTrucks: TruckEntry[]
  mixers?: TruckEntry[]
}

interface TruckEntry {
  jobName: string
  accountType: string
  truckType: string
  truckNumber: string
  date: string
  quantity: string
  materials: string
  location: string
  accountNumber: string
  pit: string
  delivered: string
  notes: string
  pay: boolean
  startTime: string
  loadTime: string
}

function processDataRows(data: any[]): ReportData {
  console.log("Processing CSV data with", data.length, "rows")
  if (data.length > 0) {
    console.log("Sample row from CSV:", JSON.stringify(data[0]).substring(0, 200) + "...")
    console.log("Available columns:", Object.keys(data[0]).join(", "))
  }

  // Group entries by truck type
  const slingers: TruckEntry[] = []
  const dumpTrucks: TruckEntry[] = []
  const tractors: TruckEntry[] = []
  const asphaltTrucks: TruckEntry[] = [] // Added new array for asphalt trucks
  const mixers: TruckEntry[] = []

  // Extract the report date from the first row's Due Date (column F)
  let reportDate = new Date().toLocaleDateString()
  if (data.length > 0) {
    try {
      // First, make sure we have a valid Due Date field
      const dateString = data[0]["Due Date"]
      console.log("Attempting to parse date from:", dateString)

      if (dateString && typeof dateString === "string" && dateString.includes(",")) {
        // Extract the month, day, and year using regex
        const dateRegex = /(\w+), (\w+) (\d+)\w+ (\d{4})/
        const match = dateString.match(dateRegex)

        if (match) {
          const [_, dayOfWeek, month, day, year] = match
          console.log("Date parts extracted:", { dayOfWeek, month, day, year })

          // Create a properly formatted date string
          const parsedDate = new Date(`${month} ${day}, ${year}`)
          if (!isNaN(parsedDate.getTime())) {
            reportDate = parsedDate.toLocaleDateString()
            console.log("Extracted report date from CSV:", reportDate)
          } else {
            console.error("Invalid date parsed:", `${month} ${day}, ${year}`)
          }
        } else {
          console.error("Date regex did not match:", dateString)
        }
      } else {
        console.error("Due Date field is not in expected format:", dateString)
      }
    } catch (e) {
      console.error("Error parsing report date:", e)
    }
  }

  // Process each row from the CSV
  data.forEach((row, index) => {
    console.log(`Processing row ${index + 1}/${data.length}: ${row["Task Name"] || "Unnamed Task"}`)

    // Update the truck number parsing to be more robust:

    // Extract driver information from the "Drivers Assigned" field
    // It comes in format like "[SMI49, SMI50P, MMH06]"
    let truckNumbers: string[] = []
    if (row["Drivers Assigned (labels)"]) {
      try {
        const driversText = String(row["Drivers Assigned (labels)"])
        console.log(`Row ${index + 1} drivers raw value:`, driversText)

        // Check if it contains commas, suggesting multiple drivers
        if (driversText.includes(",")) {
          // Remove brackets and get all drivers
          const cleanDriversText = driversText.replace(/[[\]]/g, "").trim()
          truckNumbers = cleanDriversText
            .split(",")
            .map((d: string) => d.trim())
            .filter(Boolean)
        } else {
          // Single driver, just clean it up
          truckNumbers = [driversText.replace(/[[\]]/g, "").trim()]
        }

        console.log(`Row ${index + 1} has ${truckNumbers.length} truck numbers:`, truckNumbers)
      } catch (e) {
        console.error(`Error parsing truck numbers for row ${index + 1}:`, e)
        // Default to the raw value if parsing fails
        truckNumbers = [String(row["Drivers Assigned (labels)"])]
      }
    }

    // If no truck numbers assigned, still create one entry with empty truck number
    if (truckNumbers.length === 0) {
      truckNumbers = [""]
      console.log(`Row ${index + 1} has no truck numbers, using empty string`)
    }

    // Update to use "Pit Location (labels)" instead of "Pit Location (drop down)"
    // Extract pit locations from the "Pit Location (labels)" column
    // It might come in format like "[SM-WB, SM-MM]"
    let pitLocations: string[] = []

    // Check both possible column names for pit locations
    const pitLocationField = row["Pit Location (labels)"] || row["Pit Location (drop down)"]

    if (pitLocationField) {
      console.log(`Row ${index + 1} pit location raw value:`, pitLocationField)

      try {
        const pitText = String(pitLocationField)

        // Check if the pit location is in brackets format
        if (pitText.includes(",") || (pitText.startsWith("[") && pitText.endsWith("]"))) {
          // It might be a list, try to parse it
          const cleanPitText = pitText.replace(/[[\]]/g, "").trim()
          pitLocations = cleanPitText
            .split(",")
            .map((p: string) => p.trim())
            .filter(Boolean)

          console.log(`Row ${index + 1} has ${pitLocations.length} pit locations:`, pitLocations)
        } else {
          // Single pit location
          pitLocations = [pitText.replace(/[[\]]/g, "").trim()]
          console.log(`Row ${index + 1} has a single pit location: ${pitLocations[0]}`)
        }
      } catch (e) {
        console.error(`Error parsing pit location for row ${index + 1}:`, e)
        // Default to the raw value if parsing fails
        pitLocations = [String(pitLocationField)]
      }
    } else {
      // No pit location, use empty string
      pitLocations = [""]
      console.log(`Row ${index + 1} has no pit location, using empty string`)
    }

    // Parse the due date to get a readable date
    let formattedDate = reportDate
    let startTime = "N/A"
    let loadTime = "N/A"

    if (row["Due Date"] && typeof row["Due Date"] === "string" && row["Due Date"].includes(",")) {
      try {
        // Extract date part from format like "Wednesday, March 19th 2025, 7:00:00 am -04:00"
        const dateString = row["Due Date"]

        // Extract the month, day, and year using regex
        const dateRegex = /(\w+), (\w+) (\d+)\w+ (\d{4})/
        const match = dateString.match(dateRegex)

        if (match) {
          const [_, dayOfWeek, month, day, year] = match
          // Create a properly formatted date string
          const parsedDate = new Date(`${month} ${day}, ${year}`)
          if (!isNaN(parsedDate.getTime())) {
            formattedDate = parsedDate.toLocaleDateString()
          } else {
            console.error("Invalid date parsed:", `${month} ${day}, ${year}`)
          }
        } else {
          console.error("Date regex did not match:", dateString)
        }

        // Extract time for start time
        const timeRegex = /(\d+):(\d+):(\d+) ([ap]m)/i
        const timeMatch = dateString.match(timeRegex)
        if (timeMatch) {
          const [_, hours, minutes, seconds, ampm] = timeMatch
          startTime = `${hours}:${minutes} ${ampm.toUpperCase()}`

          // Calculate load time (30 minutes before start time)
          const startHour = Number.parseInt(hours)
          const startMinute = Number.parseInt(minutes)

          let loadHour = startHour
          let loadMinute = startMinute - 30

          if (loadMinute < 0) {
            loadHour = loadHour - 1
            loadMinute = loadMinute + 60
          }

          if (loadHour < 1) {
            loadHour = 12 + loadHour
          }

          loadTime = `${loadHour.toString().padStart(2, "0")}:${loadMinute.toString().padStart(2, "0")} ${ampm.toUpperCase()}`
        }
      } catch (e) {
        console.error("Error parsing date for row:", index, e, "date string:", row["Due Date"])
      }
    }

    // Create entries for each combination of truck number and pit location
    truckNumbers.forEach((truckNumber) => {
      pitLocations.forEach((pitLocation) => {
        // Extract the first 5 characters of the account number to add to the job name
        const accountPrefix = row["🫀 Account # (short text)"] ? row["🫀 Account # (short text)"].substring(0, 5) : ""
        const jobNameWithAccount = accountPrefix
          ? `${accountPrefix} - ${row["Task Name"] || ""}`
          : row["Task Name"] || ""

        const entry: TruckEntry = {
          jobName: jobNameWithAccount,
          accountType: row["💳 Payment Type (drop down)"] || "",
          truckType: row["Truck Type (drop down)"] || "",
          truckNumber: truckNumber,
          date: formattedDate,
          quantity: row["QTY REQ'D (short text)"] || "",
          materials: row["Material Type (short text)"] || "",
          location: row["LOCATION (short text)"] || "",
          accountNumber: row["🫀 Account # (short text)"] || "",
          pit: pitLocation,
          delivered: row["TOTAL # (formula)"] || "",
          notes: row["Additional Delivery Notes (text)"] || "",
          pay: false, // Default value as it's not in the CSV
          startTime: startTime,
          loadTime: loadTime,
        }

        // Categorize by truck type
        const truckTypeLower = (entry.truckType || "").toLowerCase()
        if (truckTypeLower.includes("slinger")) {
          slingers.push(entry)
          console.log(`Added entry to slingers: ${entry.jobName} (${entry.truckNumber}) at pit ${entry.pit}`)
        } else if (truckTypeLower.includes("dump")) {
          dumpTrucks.push(entry)
          console.log(`Added entry to dump trucks: ${entry.jobName} (${entry.truckNumber}) at pit ${entry.pit}`)
        } else if (truckTypeLower.includes("trailer")) {
          tractors.push(entry)
          console.log(`Added entry to tractors: ${entry.jobName} (${entry.truckNumber}) at pit ${entry.pit}`)
        } else if (truckTypeLower.includes("mixer") || truckTypeLower.includes("standard mixer")) {
          mixers.push(entry)
          console.log(`Added entry to mixers: ${entry.jobName} (${entry.truckNumber}) at pit ${entry.pit}`)
        } else if (truckTypeLower.includes("asphalt")) {
          asphaltTrucks.push(entry)
          console.log(`Added entry to asphalt trucks: ${entry.jobName} (${entry.truckNumber}) at pit ${entry.pit}`)
        } else {
          console.warn(`Unknown truck type: "${entry.truckType}" for job: ${entry.jobName}`)
        }
      })
    })
  })

  console.log("Categorized entries:", {
    slingers: slingers.length,
    dumpTrucks: dumpTrucks.length,
    tractors: tractors.length,
    asphaltTrucks: asphaltTrucks.length,
    mixers: mixers.length,
  })

  return {
    date: reportDate,
    createdBy: "WB DISPATCH",
    createdAt: new Date().toLocaleString(),
    totalEntries: data.length,
    slingers,
    dumpTrucks,
    tractors,
    asphaltTrucks,
    mixers: mixers.length > 0 ? mixers : undefined,
  }
}

// Remove the import for revalidatePath
// import { revalidatePath } from "next/cache"
import Papa from "papaparse"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

async function processClickUpCsv(formData: FormData) {
  try {
    console.log("Server Action: Processing CSV file")
    const file = formData.get("file") as File
    const fileUrl = formData.get("fileUrl") as string

    if (!file && !fileUrl) {
      throw new Error("No file or URL provided")
    }

    let text = ""

    if (file) {
      console.log("File received:", file.name, "size:", file.size, "bytes")
      // Read the file contents
      text = await file.text()
    } else if (fileUrl) {
      console.log("Fetching CSV from URL:", fileUrl)
      // Fetch the file from the URL
      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV from URL: ${response.status} ${response.statusText}`)
      }
      text = await response.text()
    }

    console.log("File content length:", text.length, "bytes")

    // Parse the CSV with more options for robustness
    const { data, errors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Log each header to help debug
        console.log("CSV header found:", header)
        return header.trim()
      },
    })

    if (errors.length > 0) {
      console.error("CSV parsing errors:", errors)
      throw new Error("Error parsing CSV: " + errors[0].message)
    }

    console.log("CSV parsed successfully with", data.length, "rows")

    // Log the first row to see what we're working with
    if (data.length > 0) {
      console.log("First row of parsed data:", JSON.stringify(data[0]))
      console.log("Available columns:", Object.keys(data[0]).join(", "))
    }

    // Process the data into the format we need
    const reportData = processDataRows(data as any[])
    console.log("Data processed successfully")

    // Instead of using revalidatePath, we'll store the data in a global variable
    // and let the client refresh the page to get the new data
    if (typeof global !== "undefined") {
      global.GLOBAL_REPORT_DATA = reportData
      global.GLOBAL_REPORT_DATA_TIMESTAMP = Date.now()
      console.log("Stored report data in global variable with timestamp", new Date().toISOString())
    }

    return {
      success: true,
      totalEntries: reportData.totalEntries,
      date: reportData.date,
      data: reportData, // Return the full data
    }
  } catch (error) {
    console.error("Error processing CSV:", error)
    throw new Error("Failed to process CSV file: " + (error instanceof Error ? error.message : String(error)))
  }
}

async function generatePdf(reportData: ReportData): Promise<{ blob: Blob }> {
  try {
    console.log(
      "Starting PDF generation with",
      reportData.slingers?.length || 0,
      "slingers,",
      reportData.dumpTrucks?.length || 0,
      "dump trucks,",
      reportData.tractors?.length || 0,
      "tractors,",
      reportData.asphaltTrucks?.length || 0,
      "asphalt trucks,",
      reportData.mixers?.length || 0,
      "mixers",
    )

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()

    // Get the font with WinAnsi encoding explicitly specified
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica, { encoding: "WinAnsi" })
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold, { encoding: "WinAnsi" })

    // Set some basic styles
    const fontSize = 9
    const titleFontSize = 14
    const headerFontSize = 11
    const margin = 35 // Reduced from 40 to give more space
    const lineHeight = fontSize * 1.5

    // Define section colors
    const sectionColors = {
      "Dump Truck Report": { r: 0.56, g: 0.93, b: 0.56 }, // Light green
      "Slinger Report": { r: 0.53, g: 0.81, b: 0.98 }, // Light blue
      "Trailer Report": { r: 1.0, g: 0.84, b: 0.0 }, // Light amber
      "Asphalt Report": { r: 0.95, g: 0.5, b: 0.2 }, // Orange for asphalt
      "Mixer Report": { r: 0.87, g: 0.63, b: 0.87 }, // Light purple
    }

    // Function to draw a section on a page
    const drawSectionOnPage = (
      page: any,
      title: string,
      entries: TruckEntry[],
      startIndex: number,
      endIndex: number,
      startY: number,
    ) => {
      console.log(`Drawing ${title} section, entries ${startIndex + 1}-${endIndex + 1} of ${entries.length}`)

      // Calculate available height for entries
      const availableHeight = startY - margin - 50 // Reserve space for footer

      // Increased height per entry for better spacing and text wrapping
      const entryHeight = lineHeight * 3.5 // Increased from 2.2 to 3.5 for more row height

      const headerHeight = lineHeight * 3 // Height for section title and column headers

      // Calculate how many entries can fit on this page
      const maxEntriesPerPage = Math.floor((availableHeight - headerHeight) / entryHeight)
      const entriesToDraw = Math.min(endIndex - startIndex + 1, maxEntriesPerPage)

      console.log(`Can fit ${maxEntriesPerPage} entries per page, drawing ${entriesToDraw} entries`)

      // Draw the section title with colored background
      const titleWidth = page.getWidth() - margin * 2
      const titleHeight = lineHeight * 1.5

      // Draw colored background for title
      const color = sectionColors[title as keyof typeof sectionColors] || { r: 0.9, g: 0.9, b: 0.9 }
      page.drawRectangle({
        x: margin,
        y: startY - titleHeight,
        width: titleWidth,
        height: titleHeight,
        color: rgb(color.r, color.g, color.b),
      })

      // Draw the title text
      page.drawText(title, {
        x: margin + 5,
        y: startY - titleHeight + 5,
        size: headerFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      startY -= titleHeight + lineHeight

      // Define columns for the new format - with Payment column on the left
      // Adjusted column widths to better fit content
      const columns = [
        { title: "Payment?", width: 45, field: "pay", type: "checkbox" },
        { title: "Job Name", width: 130, field: "jobName", type: "text" },
        { title: "Load Time", width: 50, field: "loadTime", type: "text" },
        { title: "Driver", width: 45, field: "truckNumber", type: "text" },
        { title: "Pit", width: 40, field: "pit", type: "text" },
        { title: "Location", width: 130, field: "location", type: "text-wrap" },
        { title: "Materials", width: 110, field: "materials", type: "text-wrap" },
        { title: "Notes", width: 100, field: "notes", type: "text-wrap" },
      ]

      // Draw column headers
      let xPosition = margin
      for (const column of columns) {
        page.drawText(column.title, {
          x: xPosition + 2,
          y: startY,
          size: fontSize,
          font: boldFont,
        })
        xPosition += column.width
      }

      // Draw a line under the header
      startY -= lineHeight
      page.drawLine({
        start: { x: margin, y: startY + fontSize / 2 },
        end: { x: page.getWidth() - margin, y: startY + fontSize / 2 },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      })

      // Draw entries
      for (let i = 0; i < entriesToDraw; i++) {
        const entry = entries[startIndex + i]
        startY -= entryHeight

        console.log(`Drawing entry ${startIndex + i + 1}: ${entry.jobName} (${entry.truckNumber})`)

        // Draw entry data
        xPosition = margin
        for (const column of columns) {
          if (column.type === "checkbox") {
            // Draw payment checkbox
            if (entry.pay) {
              // Draw a box with an X for checked
              page.drawText("[X]", {
                x: xPosition + 20, // Center it better
                y: startY + entryHeight / 2 - fontSize / 2, // Center vertically in the row
                size: fontSize + 1, // Slightly larger for better visibility
                font: font,
              })
            } else {
              // Draw an empty box for unchecked
              page.drawText("[ ]", {
                x: xPosition + 20, // Center it better
                y: startY + entryHeight / 2 - fontSize / 2, // Center vertically in the row
                size: fontSize + 1, // Slightly larger for better visibility
                font: font,
              })
            }

            // Check if payment type is "Credit Card" and add a small "Card" checkbox if it is
            if (entry.accountType === "Credit Card") {
              page.drawText("Card", {
                x: xPosition + 2,
                y: startY + entryHeight / 2 - fontSize / 2 - lineHeight, // Position below the payment checkbox
                size: fontSize - 1, // Slightly smaller text
                font: font,
              })

              // Draw a checked box for credit card
              page.drawText("[X]", {
                x: xPosition + 20, // Center it better
                y: startY + entryHeight / 2 - fontSize / 2 - lineHeight, // Position below the payment checkbox
                size: fontSize, // Same size as the text
                font: font,
              })
            }
          } else if (column.type === "text-wrap") {
            // Handle wrapped text for location, materials, and notes
            const value = entry[column.field as keyof TruckEntry] || ""
            const textValue = typeof value === "string" ? value : String(value)

            // Skip empty values
            if (!textValue.trim()) {
              xPosition += column.width
              continue
            }

            // Calculate how many characters can fit per line
            const charsPerLine = Math.floor(column.width / (fontSize * 0.6)) - 1

            // Only split the text if it's longer than what fits on one line
            if (textValue.length > charsPerLine) {
              // Split text into words
              const words = textValue.split(" ")
              const lines: string[] = []
              let currentLine = ""

              // Build lines word by word to avoid cutting words
              words.forEach((word) => {
                if ((currentLine + " " + word).length <= charsPerLine) {
                  currentLine = currentLine ? currentLine + " " + word : word
                } else {
                  if (currentLine) lines.push(currentLine)
                  currentLine = word
                }
              })

              // Add the last line if there's anything left
              if (currentLine) lines.push(currentLine)

              // Limit to 3 lines maximum
              const linesToDraw = lines.slice(0, 3)

              // Draw each line
              linesToDraw.forEach((line, lineIndex) => {
                page.drawText(line, {
                  x: xPosition + 2,
                  y: startY + entryHeight / 2 + lineHeight * (1 - lineIndex) - fontSize,
                  size: fontSize,
                  font: font,
                })
              })

              // If we had to truncate, add an ellipsis to the last line
              if (lines.length > 3) {
                const lastLineIndex = 2 // 0-based index for the third line
                const lastLine = linesToDraw[lastLineIndex]
                if (lastLine && lastLine.length > 3) {
                  // Erase the last few characters and add ellipsis
                  const x = xPosition + 2 + (lastLine.length - 3) * (fontSize * 0.6)
                  const y = startY + entryHeight / 2 + lineHeight * (1 - lastLineIndex) - fontSize

                  // Draw a small white rectangle to cover the end of the line
                  page.drawRectangle({
                    x: x,
                    y: y - 1,
                    width: fontSize * 2,
                    height: fontSize + 2,
                    color: rgb(1, 1, 1), // White
                  })

                  // Draw the ellipsis
                  page.drawText("...", {
                    x: x,
                    y: y,
                    size: fontSize,
                    font: font,
                  })
                }
              }
            } else {
              // Draw single line text centered vertically in the row
              page.drawText(textValue, {
                x: xPosition + 2,
                y: startY + entryHeight / 2 - fontSize / 2,
                size: fontSize,
                font: font,
              })
            }
          } else {
            // Draw regular text field centered vertically in the row
            const value = entry[column.field as keyof TruckEntry] || ""
            const textValue = typeof value === "string" ? value : String(value)

            // Limit text length based on column width
            const maxChars = Math.floor(column.width / (fontSize * 0.6)) - 1
            const displayText = textValue.substring(0, maxChars)

            page.drawText(displayText, {
              x: xPosition + 2,
              y: startY + entryHeight / 2 - fontSize / 2, // Center vertically in the row
              size: fontSize,
              font: font,
            })
          }
          xPosition += column.width
        }

        // Draw a light line between entries
        page.drawLine({
          start: { x: margin, y: startY - lineHeight / 2 },
          end: { x: page.getWidth() - margin, y: startY - lineHeight / 2 },
          thickness: 0.2,
          color: rgb(0.8, 0.8, 0.8),
        })
      }

      return {
        lastEntryIndex: startIndex + entriesToDraw - 1,
        nextY: startY - lineHeight,
      }
    }

    // Function to add a new page and draw the header
    const addPageWithHeader = (title: string, pageNumber: number, totalPages: number) => {
      // Increase page width slightly to ensure all columns fit
      const page = pdfDoc.addPage([820, 612]) // Slightly wider landscape letter size
      console.log(`Adding page ${pageNumber} of ${totalPages} for ${title}`)

      // Draw the title
      page.drawText(`Spallina Materials Trucking Report`, {
        x: margin,
        y: page.getHeight() - margin,
        size: titleFontSize,
        font: boldFont,
      })

      // Draw the date
      page.drawText(`${reportData.date}`, {
        x: margin,
        y: page.getHeight() - margin - lineHeight,
        size: fontSize,
        font: boldFont,
      })

      // Draw a line
      page.drawLine({
        start: { x: margin, y: page.getHeight() - margin - lineHeight * 2 },
        end: { x: page.getWidth() - margin, y: page.getHeight() - margin - lineHeight * 2 },
        thickness: 1,
        color: rgb(0, 0, 0),
      })

      // Add a footer with page number and timestamp
      const timestamp = new Date().toLocaleString()
      page.drawText(`Generated: ${timestamp}`, {
        x: margin,
        y: margin / 2,
        size: fontSize,
        font: font,
      })

      page.drawText(`Page ${pageNumber} of ${totalPages}`, {
        x: page.getWidth() - margin - 80,
        y: margin / 2,
        size: fontSize,
        font: font,
      })

      return {
        page,
        startY: page.getHeight() - margin - lineHeight * 3,
      }
    }

    // Calculate total pages needed
    const entriesPerPage = 8 // Reduced from 10 to 8 due to increased row height
    let totalPages = 0

    if (reportData.dumpTrucks?.length > 0) {
      totalPages += Math.ceil(reportData.dumpTrucks.length / entriesPerPage)
    }

    if (reportData.slingers?.length > 0) {
      totalPages += Math.ceil(reportData.slingers.length / entriesPerPage)
    }

    if (reportData.tractors?.length > 0) {
      totalPages += Math.ceil(reportData.tractors.length / entriesPerPage)
    }

    if (reportData.asphaltTrucks?.length > 0) {
      totalPages += Math.ceil(reportData.asphaltTrucks.length / entriesPerPage)
    }

    if (reportData.mixers && reportData.mixers.length > 0) {
      totalPages += Math.ceil(reportData.mixers.length / entriesPerPage)
    }

    // Ensure at least one page per section
    totalPages = Math.max(totalPages, 1)
    console.log(`Total pages needed: ${totalPages}`)

    // Function to draw a complete section with pagination
    const drawCompleteSection = (title: string, entries: TruckEntry[], currentPageNumber: number) => {
      if (!entries || entries.length === 0) return currentPageNumber

      let pageNumber = currentPageNumber
      let currentPage = null
      let currentY = 0
      let entryIndex = 0

      console.log(`Drawing ${title} section with ${entries.length} entries starting at page ${pageNumber}`)

      while (entryIndex < entries.length) {
        // Create a new page if needed
        if (!currentPage) {
          const pageInfo = addPageWithHeader(title, pageNumber, totalPages)
          currentPage = pageInfo.page
          currentY = pageInfo.startY
          pageNumber++
        }

        // Draw as many entries as will fit on the current page
        const result = drawSectionOnPage(currentPage, title, entries, entryIndex, entries.length - 1, currentY)

        entryIndex = result.lastEntryIndex + 1
        console.log(`Finished drawing entries up to index ${entryIndex} of ${entries.length}`)

        // If we have more entries, create a new page
        if (entryIndex < entries.length) {
          currentPage = null
        }
      }

      return pageNumber
    }

    // Draw each section
    let currentPageNumber = 1

    if (reportData.dumpTrucks?.length > 0) {
      currentPageNumber = drawCompleteSection("Dump Truck Report", reportData.dumpTrucks, currentPageNumber)
    }

    if (reportData.slingers?.length > 0) {
      currentPageNumber = drawCompleteSection("Slinger Report", reportData.slingers, currentPageNumber)
    }

    if (reportData.tractors?.length > 0) {
      currentPageNumber = drawCompleteSection("Trailer Report", reportData.tractors, currentPageNumber)
    }

    if (reportData.asphaltTrucks?.length > 0) {
      currentPageNumber = drawCompleteSection("Asphalt Report", reportData.asphaltTrucks, currentPageNumber)
    }

    if (reportData.mixers && reportData.mixers.length > 0) {
      currentPageNumber = drawCompleteSection("Mixer Report", reportData.mixers, currentPageNumber)
    }

    // Serialize the PDF to bytes
    console.log("Finalizing PDF document")
    const pdfBytes = await pdfDoc.save()

    // Convert to Blob
    const blob = new Blob([pdfBytes], { type: "application/pdf" })
    console.log(`PDF generated successfully, size: ${blob.size} bytes`)

    return { blob }
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw new Error("Failed to generate PDF: " + (error instanceof Error ? error.message : String(error)))
  }
}

async function exportReportToGithub(reportData: ReportData): Promise<void> {
  // Placeholder function for exporting report to GitHub
  console.log("Exporting report to GitHub (placeholder function)")
  console.log("Report data:", reportData)
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return
}

export const dynamic = "force-dynamic"

// Declare the GLOBAL_REPORT_DATA_TIMESTAMP variable
declare global {
  var GLOBAL_REPORT_DATA: ReportData | undefined
  var GLOBAL_REPORT_DATA_TIMESTAMP: number | undefined
}

async function getReportData(): Promise<ReportData | null> {
  // Placeholder function for getting report data
  console.log("Getting report data (placeholder function)")

  if (global.GLOBAL_REPORT_DATA && global.GLOBAL_REPORT_DATA_TIMESTAMP) {
    console.log(
      "Found report data in global scope with timestamp",
      new Date(global.GLOBAL_REPORT_DATA_TIMESTAMP).toISOString(),
    )
    return global.GLOBAL_REPORT_DATA
  } else {
    console.log("No report data found in global scope")
    return null
  }
}

async function debugGlobalState(): Promise<{
  GLOBAL_REPORT_DATA_TIMESTAMP: number | undefined
  reportDataAvailable: boolean
}> {
  return {
    GLOBAL_REPORT_DATA_TIMESTAMP: global.GLOBAL_REPORT_DATA_TIMESTAMP,
    reportDataAvailable: !!global.GLOBAL_REPORT_DATA,
  }
}

export { processClickUpCsv, generatePdf, exportReportToGithub, debugGlobalState, getReportData }

