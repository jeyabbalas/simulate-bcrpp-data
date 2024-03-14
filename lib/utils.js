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

function formatDataset(data, dtypes) {
    return data.map(sample => {
        let formattedSample = {};
        for (let key in sample) {
            let value = sample[key];
            switch (dtypes[key]) {
                case "int":
                    formattedSample[key] = parseInt(value);
                    break;
                case "float":
                    formattedSample[key] = parseFloat(value);
                    break;
                case "str":
                default:
                    formattedSample[key] = String(value);
                    break;
            }
        }
        return formattedSample;
    });
}

export {fetchFileAsText, fetchFileAsJson, fetchCsvFileAsJson, parseCsv, formatDataset};