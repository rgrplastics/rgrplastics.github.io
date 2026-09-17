const loadPdfImage = (source) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext("2d").drawImage(image, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = reject;
    image.src = source;
  });

const enquiryPayload = (payload) =>
  payload || {
    enquiryId: document.getElementById("enquiry-id-display")?.textContent?.trim(),
    firstName: document.getElementById("enquiry-success-name")?.textContent?.trim() || "Customer",
    lastName: document.getElementById("enq-last-name")?.value?.trim() || "",
    companyName: document.getElementById("enq-company")?.value?.trim() || "",
    items: JSON.parse(localStorage.getItem("rgrQuoteCart") || "[]"),
    address: document.getElementById("enq-address")?.value || "",
    mobile: document.getElementById("enq-mobile")?.value || "",
    email: document.getElementById("enq-email")?.value || "",
    whatsapp: document.getElementById("enq-whatsapp")?.value || "",
    enquiryDate: new Date().toLocaleDateString("en-CA"),
    source: "Website enquiry",
    status: "Submitted",
  };

const cleanValue = (value, fallback = "-") => String(value || fallback);
const singleLine = (value) =>
  String(value || "")
    .replace(/\s*\n\s*/g, " ")
    .trim();
const drawPageFooter = (pdf, pageNumber, pageWidth, pageHeight) => {
  pdf.setDrawColor(91, 104, 114);
  pdf.setLineWidth(0.2);
  pdf.line(10, pageHeight - 9, pageWidth - 10, pageHeight - 9);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(83, 97, 106);
  pdf.text("RGR Plastics and Traders | Product Enquiry", 10, pageHeight - 4.5);
  pdf.text(`Page ${pageNumber}/${pdf.internal.getNumberOfPages()}`, pageWidth - 10, pageHeight - 4.5, { align: "right" });
};

const downloadEnquiryPdf = async (payload = window.RGR_LATEST_ENQUIRY || null) => {
  if (!window.jspdf?.jsPDF) {
    alert("The PDF generator is unavailable. Please refresh the page and try again.");
    return;
  }

  const enquiry = enquiryPayload(payload);
  const enquiryId = cleanValue(enquiry.enquiryId, "RGR-ENQ-Preview");
  const firstName = cleanValue(enquiry.firstName, "Customer");
  const personName = [enquiry.firstName, enquiry.lastName].filter(Boolean).join(" ").trim();
  const companyName = cleanValue(enquiry.companyName, personName || firstName);
  const items = Array.isArray(enquiry.items) ? enquiry.items : [];
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  if (typeof pdf.autoTable !== "function") {
    alert("The PDF table plugin is unavailable. Please refresh the page and try again.");
    return;
  }

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - 20;
  const accent = [23, 59, 84];
  const line = [91, 104, 114];
  const muted = [247, 249, 250];
  const logoData = await loadPdfImage("img/rgr/logo-pt.png").catch(() => null);

  const footer = (data) => drawPageFooter(pdf, data.pageNumber, pageWidth, pageHeight);
  const baseOptions = {
    margin: { left: 10, right: 10, bottom: 13 },
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      textColor: [31, 41, 51],
      lineColor: line,
      lineWidth: 0.2,
      cellPadding: 2.5,
      valign: "middle",
    },
    tableLineColor: line,
    tableLineWidth: 0.35,
    alternateRowStyles: { fillColor: muted },
    didDrawPage: footer,
  };

  /** Title */
  const titleTop = 10;
  const titleHeight = 9;
  pdf.setFillColor(...accent);
  pdf.rect(10, titleTop, contentWidth, titleHeight, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(255, 255, 255);
  pdf.text("PRODUCT ENQUIRY", pageWidth / 2, titleTop + 6, { align: "center" });

  /** Company Details */
  const companyTop = titleTop + titleHeight + 3;
  const companyHeight = 31;
  const companyLogoWidth = 55;
  const companyTextX = 10 + companyLogoWidth;
  if (logoData) {
    pdf.addImage(logoData, "PNG", 14, companyTop + 3, 45, 15.5);
  }
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...accent);
  pdf.text("RGR Plastics and Traders", companyTextX + 3, companyTop + 5.5);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text("2/501-B Railway Station Road, Thiruvalanjuli, Kumbakonam, Thanjavur - 612302", companyTextX + 3, companyTop + 10.5);
  pdf.text("GST: 33BBBPV3945E1ZP", companyTextX + 3, companyTop + 15.5);
  pdf.text("Contact:", companyTextX + 3, companyTop + 20.5);
  pdf.setFont("helvetica", "bold");
  pdf.text("91-95003-69437, 91-79043-61090", companyTextX + 15, companyTop + 20.5);
  pdf.setFont("helvetica", "normal");
  pdf.text("| veeramanikandan.tvz@gmail.com", companyTextX + 59, companyTop + 20.5);
  pdf.text("Website: https://rgrplastics.in", companyTextX + 3, companyTop + 25.5);
  const companyBottom = companyTop + companyHeight;
  pdf.line(10, companyBottom, 10 + contentWidth, companyBottom);

  /** Customer Details */
  const customerTop = companyBottom + 3;
  const customerHeaderHeight = 8;
  const customerBodyTop = customerTop + customerHeaderHeight;
  const customerLeftX = 13;
  const customerTextX = 72;
  const singleAddress = singleLine(enquiry.address);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...accent);
  pdf.text("Customer Details", customerLeftX, customerTop + 3.5);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.setTextColor(31, 41, 51);
  pdf.text(companyName, customerTextX, customerTop + 3.5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(`Address: ${cleanValue(singleAddress)}`, customerTextX, customerTop + 8.5);
  pdf.text(`Contact Person: ${cleanValue(firstName)}`, customerTextX, customerTop + 13.5);
  pdf.text(`Mobile: ${cleanValue(enquiry.mobile)}, WhatsApp: ${cleanValue(enquiry.whatsapp)}`, customerTextX, customerTop + 18.5);
  pdf.text(`Email: ${cleanValue(enquiry.email)}`, customerTextX, customerTop + 23.5);

  const enquiryTop = customerTop + 31;
  pdf.setDrawColor(...line);
  pdf.setLineWidth(0.2);
  pdf.line(12, enquiryTop - 2, 10 + contentWidth - 2, enquiryTop - 2);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...accent);
  pdf.text("Enquiry Details", customerLeftX, enquiryTop + 3.5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text("Enquiry ID:", customerTextX, enquiryTop + 3.5);
  pdf.setFont("helvetica", "bold");
  pdf.text(cleanValue(enquiryId), customerTextX + 15, enquiryTop + 3.5);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Date: ${cleanValue(enquiry.enquiryDate)}`, customerTextX, enquiryTop + 8.5);

  const customerBottom = enquiryTop + 20;
  pdf.line(10, customerBottom, 10 + contentWidth, customerBottom);
  
  /** Product Requirements */
  const productRows = items.length ? items.map((item, index) => [String(index + 1), cleanValue(item.code), cleanValue(item.purpose), cleanValue(item.colour), cleanValue(item.size), cleanValue(item.material), cleanValue(item.grade), cleanValue(item.quantity)]) : [["-", "No products", "-", "-", "-", "-", "-"]];

  pdf.autoTable({
    ...baseOptions,
    startY: customerBottom + 7,
    head: [[{ content: "PRODUCT REQUIREMENTS", colSpan: 8 }]],
    body: [],
    headStyles: {
      fillColor: accent,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: { 0: { cellWidth: contentWidth } },
  });

  pdf.autoTable({
    ...baseOptions,
    startY: pdf.lastAutoTable.finalY,
    head: [["Sl. No.", "Product code", "Product", "Colour", "Size", "Material", "Grade", "Quantity"]],
    body: productRows,
    styles: { ...baseOptions.styles, fontSize: 7.5, cellPadding: 3 },
    headStyles: {
      fillColor: accent,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 15, halign: "center" },
      1: { cellWidth: 25 },
      2: { cellWidth: 45 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 },
      7: { cellWidth: 25, halign: "center" },
    },
  });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(83, 97, 106);
  pdf.text("Note", 10, pdf.lastAutoTable.finalY + 6);
  pdf.text("This product enquiry was generated through the online portal. Product prices and rates are intentionally not included.", 15, pdf.lastAutoTable.finalY + 10);
  pdf.text("This document records the customer's product requirements. It is not a quotation, tax invoice, order confirmation, or acceptance of supply.", 15, pdf.lastAutoTable.finalY + 14);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(83, 97, 106);
  pdf.text("This is a computer-generated product enquiry.", pageWidth / 2, pdf.lastAutoTable.finalY + 18, { align: "center" });
  pdf.save(`product-enquiry-${enquiryId.replace(/[^a-z0-9-]+/gi, "-")}.pdf`);
};

window.downloadEnquiryPdf = downloadEnquiryPdf;
