import React from "react";

type Column = {
  header: string;
  accessorKey: string;
  className?: string;
};

type TableProps<T> = {
  columns: Column[];
  data: T[];
  renderRow: (item: T) => React.ReactNode;
};

const Table = <T,>({ columns, data, renderRow }: TableProps<T>) => {
  return (
    <div className="w-full mt-4 overflow-x-auto">
      <table className="w-full border-collapse">
        {/* TABLE HEAD */}
        <thead>
          <tr className="text-left text-gray-600 text-sm border-b">
            {columns.map((col) => (
              <th
                key={col.accessorKey}
                className={`px-4 py-3 ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* TABLE BODY */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-6">
                No data found
              </td>
            </tr>
          ) : (
            data.map((item) => renderRow(item))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
