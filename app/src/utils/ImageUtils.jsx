export const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  
  export const escapeCSV = (text) => {
    if (!text) return "";
    return `"${text.replace(/"/g, '""')}"`;
  };