import RNFetchBlob from 'rn-fetch-blob';

export const uploadPDF = async (pdfFile) => {
  try {
    // Read the PDF file
    const fileData = await RNFetchBlob.fs.readFile(pdfFile.uri.replace('file://', ''), 'base64');
    
    // Create form data
    const data = new FormData();
    data.append('file', fileData);
    data.append('fileName', pdfFile.name);
    data.append('fileType', 'certificate');

    // Make the API call
    const response = await fetch('http://192.168.10.6:3000/api/upload-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: data
    });

    if (!response.ok) {
      throw new Error('PDF upload failed');
    }

    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error('PDF Upload Error:', error);
    throw error;
  }
};