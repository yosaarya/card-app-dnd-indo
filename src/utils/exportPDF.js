export function generatePDF(elementId) {

  const element = document.getElementById(elementId);

  const opt = {
    margin: 0,

    filename: 'spellcards.pdf',

    image: {
      type: 'jpeg',
      quality: 0.92
    },

    html2canvas: {
      scale: 1,
      useCORS: true,
      logging: false
    },

    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    }
  };

  html2pdf()
    .set(opt)
    .from(element)
    .save();
}