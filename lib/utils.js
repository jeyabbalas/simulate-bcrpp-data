function parseCsv(csvData) {
    const rows = csvData.split("\n");
    const headers = rows[0].split(",");
    const data = [];

    for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(",");
        if (values.length === headers.length) {
            const rowData = {};
            for (let j = 0; j < headers.length; j++) {
                rowData[headers[j]] = values[j];
            }
            data.push(rowData);
        }
    }

    return data;
}


async function instantiatePyodide() {
    const pyodideVersion = '0.25.0';
    const pyodideEsmUrl = 'https://cdn.jsdelivr.net/npm/pyodide@' + pyodideVersion + '/+esm';
    const pyodideRootUrl = 'https://cdn.jsdelivr.net/pyodide/v' + pyodideVersion + '/full/';
    return (await import(pyodideEsmUrl)).loadPyodide({indexURL: pyodideRootUrl});
}


export {parseCsv, instantiatePyodide};