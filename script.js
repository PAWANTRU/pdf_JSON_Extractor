
    const pdfFileInput = document.getElementById("pdfFile");
    const extractBtn = document.getElementById("extractBtn");
    const jsonOutput = document.getElementById("jsonOutput");
    const outputDiv = document.getElementById("output");
    const downloadBtn = document.getElementById("downloadBtn");

    // Function to extract text from PDF
    async function extractTextFromPDF(file) {
      const fileReader = new FileReader();

      return new Promise((resolve, reject) => {
        fileReader.onload = async function() {
          const typedArray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;

          let pdfData = {
            file_name: file.name,
            total_pages: pdf.numPages,
            pages: []
          };

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            
            pdfData.pages.push({
              page_number: i,
              content: pageText.trim() || "[No text found]"
            });
          }

          resolve(pdfData);
        };

        fileReader.onerror = reject;
        fileReader.readAsArrayBuffer(file);
      });
    }

    // Extract Button Click Event
    extractBtn.addEventListener("click", async () => {
      const file = pdfFileInput.files[0];
      if (!file) {
        alert("Please select a PDF file first.");
        return;
      }

      const extractedData = await extractTextFromPDF(file);
      
      // Show JSON in UI
      jsonOutput.textContent = JSON.stringify(extractedData, null, 4);
      outputDiv.classList.remove("hidden");

      // Set up download button
      downloadBtn.onclick = () => {
        const blob = new Blob([JSON.stringify(extractedData, null, 4)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file.name.replace(".pdf", "")}_output.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
    });