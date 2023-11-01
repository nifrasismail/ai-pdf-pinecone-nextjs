import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromFirebaseStorage } from "./firebase";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";

import md5 from "md5";

let pinecone: Pinecone | null = null;

export const getPineconeClient = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONTMENT!,
    });
  }
  return pinecone;
};

export const loadCloudStorageIntoPinecone = async (fileKey: string) => {
  // 1. Obtain the pdf --< downad and read from pdf
  const fileName = await downloadFromFirebaseStorage(fileKey);
  const loader = new PDFLoader(fileName!);
  const pages = await loader.load();

  // 2. split and segment the pdf
  const documents = await Promise.all(
    pages.map((page) => prepareDocument(page))
  );

  // 3. vectorize and embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  // 4. uplaod to pinecone
  const client = await getPineconeClient();
  const index = client.index("ai-pdf");
  await index.upsert(vectors);

  return documents[0];
};

export async function embedDocument(doc: Document) {
  try {
    if (doc && doc.pageContent && doc.metadata) {
      const embeddings = await getEmbeddings(doc.pageContent);
      const hash = md5(doc.pageContent);
      return {
        id: hash,
        values: embeddings,
        metadata: {
          text: doc.metadata.text,
          pageNumber: doc.metadata.pageNumber,
        },
      } as PineconeRecord;
    }
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: any) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}
