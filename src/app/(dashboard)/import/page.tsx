"use client";
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false); // Ye state loader control karegi
  const router = useRouter();

  const downloadSample = (format: 'csv' | 'xlsx') => {
    const sampleData = [
      {
        name: "Rohit Sharma",
        email: "rohit@example.com",
        phone: "9876543210",
        gender: "M",
        dob: "2006-05-12",
        jerseyNumber: 45,
        address: "Mumbai",
        teamCode: "TEAM-U14-A"
      },
      {
        name: "Smriti Mandhana",
        email: "smriti@example.com",
        phone: "9123456789",
        gender: "F",
        dob: "2007-08-20",
        jerseyNumber: 18,
        address: "Bangalore",
        teamCode: "TEAM-GIRLS-B"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Players");

    if (format === 'xlsx') {
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, 'player_import_template.xlsx');
    } else {
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      const data = new Blob([csvOutput], { type: 'text/csv;charset=utf-8' });
      saveAs(data, 'player_import_template.csv');
    }
  };

  const handleImport = async () => {
    if (!file) return alert("Please select a file first!");

    setLoading(true); // 🔥 LOADER START

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const response = await fetch('/api/player/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            players: jsonData,
            fileName: file.name // ✅ Ye add kar diya hai
          }),
        });
        const result = await response.json();

        if (response.ok) {
          alert(`🎉 ${result.message}`);
          router.push('/list/players');
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to process file.");
      } finally {
        setLoading(false); // 🔥 LOADER STOP (chahe success ho ya fail)
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50/50 p-4">

      {/* 🔥🔥🔥 FULL SCREEN LOADER OVERLAY 🔥🔥🔥 */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-pulse">
            {/* Spinning Circle */}
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800">Importing Data...</h2>
            <p className="text-gray-500 text-sm mt-2">Please wait, do not close this window.</p>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Bulk Import Players</h1>
          <p className="text-gray-500 mt-2">Add multiple players via Excel or CSV</p>
        </div>

        {/* STEP 1: DOWNLOAD */}
        <div className="mb-8 bg-blue-50 p-5 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
            <h3 className="font-semibold text-blue-900">Download Template</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => downloadSample('xlsx')} className="py-2.5 bg-white text-blue-700 font-medium rounded-lg border border-blue-200 hover:bg-blue-100 transition shadow-sm">
              Download Excel
            </button>
            <button onClick={() => downloadSample('csv')} className="py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-100 transition shadow-sm">
              Download CSV
            </button>
          </div>
        </div>

        {/* STEP 2: UPLOAD */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold">2</div>
            <h3 className="font-semibold text-gray-900">Upload Filled File</h3>
          </div>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {file ? (
                <div className="text-center">
                  <p className="text-green-600 font-bold mb-1">File Selected!</p>
                  <p className="text-sm text-gray-500">{file.name}</p>
                </div>
              ) : (
                <>
                  <p className="mb-2 text-sm text-gray-500"><span className="font-bold">Click to upload</span></p>
                  <p className="text-xs text-gray-400">XLSX or CSV</p>
                </>
              )}
            </div>
            <input type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
          </label>
        </div>

        <button
          onClick={handleImport}
          disabled={loading || !file}
          className="w-full py-4 bg-black hover:bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Import
        </button>

      </div>
    </div>
  );
}