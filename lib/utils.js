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

export {parseCsv};