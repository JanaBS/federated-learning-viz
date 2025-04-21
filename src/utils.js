export function formatMonetData(response) {
  const columns = response.columns.map(col => col.name);
  return response.data.map(row => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}
