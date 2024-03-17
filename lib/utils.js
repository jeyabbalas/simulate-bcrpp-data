async function fetchFileAsText(url) {
    const response = await fetch(url);
    return response.text();
}


async function fetchFileAsJson(url) {
    const response = await fetch(url);
    return response.json();
}


async function fetchCsvFileAsJson(url) {
    const response = await fetch(url);
    return parseCsv(await response.text());
}


function parseCsv(csvData) {
    const rows = csvData.trim().split("\n");
    const headers = rows[0].split(",");
    const data = rows.slice(1).map(row => row.split(","));

    return {
        columns: headers,
        index: Array.from({length: data.length}, (_, i) => i),
        data: data
    };
}


function formatDataset(data, dtypes) {
    const formattedData = data.data.map(row => {
        return row.map((value, columnIndex) => {
            const columnName = data.columns[columnIndex];
            const dtype = dtypes[columnName];
            switch (dtype) {
                case "int":
                    return parseInt(value);
                case "float":
                    return parseFloat(value);
                case "str":
                default:
                    return String(value);
            }
        });
    });

    return {
        ...data,
        data: formattedData
    };
}

export {fetchFileAsText, fetchFileAsJson, fetchCsvFileAsJson, parseCsv, formatDataset};