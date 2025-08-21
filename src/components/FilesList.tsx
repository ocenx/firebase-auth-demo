import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

interface FileItem {
  id: string;
  fileName: string;
  url: string;
  uploadedBy: string;
}

export default function FileList() {
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    const q = query(collection(db, "files"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FileItem[];
      setFiles(list);
    });
    return () => unsub();
  }, []);

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-3">Uploaded Files</h2>
      <ul>
        {files.map((file) => (
          <li key={file.id} className="mb-2 flex justify-between items-center border-b pb-2">
            <span>{file.fileName}</span>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
