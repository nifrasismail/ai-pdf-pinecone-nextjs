import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  getBytes,
} from "firebase/storage";
import fs from "fs";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export async function uploadToFirebaseBucket(file: File) {
  try {
    const fileKey =
      "uploads/" + Date.now().toString() + file.name.replace(" ", "-");
    const pdfReference = ref(storage, fileKey);
    const snapshot = await uploadBytes(pdfReference, file);
    const downloadUrl = await getDownloadURL(pdfReference);
    return Promise.resolve({
      fileKey: fileKey,
      fileName: file.name,
      url: downloadUrl,
    });
  } catch (error) {
    console.log(`Upload failed: ${error}`);
  }
}

export async function downloadFromFirebaseStorage(fileKey: string) {
  try {
    const pdfReference = ref(storage, fileKey);
    const downloadURL = await getDownloadURL(pdfReference);

    // Download the file from storage and store it as buffer
    const file = await getBytes(pdfReference);
    const fileName = `/tmp/pdf-${Date.now()}.pdf`;
    const buffer = Buffer.from(file);

    await fs.promises.writeFile(fileName, buffer, "utf8");
    return fileName;
  } catch (error) {
    console.log(`Download failed: ${error}`);
  }
}

export async function getFirebaseFileUrl(fileKey: string) {
  try {
    const pdfReference = ref(storage, fileKey);
    const downloadURL = await getDownloadURL(pdfReference);
    return downloadURL;
  } catch (error) {
    console.log(`Download failed: ${error}`);
  }
}
