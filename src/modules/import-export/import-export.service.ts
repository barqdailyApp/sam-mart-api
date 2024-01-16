import { BadRequestException, Injectable } from "@nestjs/common";
import * as excelJs from 'exceljs';
import * as tmp from 'tmp';

@Injectable()
export class ImportExportService {
    constructor() { }
    async import(filePath: string) {
        try {
            const workbook = new excelJs.Workbook();
            await workbook.xlsx.readFile(filePath);

            const sheet = workbook.getWorksheet(1); // Assuming there is only one sheet

            const jsonData = [];
            sheet.eachRow((row, rowNumber) => {
                if (rowNumber !== 1) { // Skip the header row
                    const rowData = {};
                    row.eachCell((cell, colNumber) => {
                        rowData[String(sheet.getCell(1, colNumber).value)] = cell.value;
                    });
                    jsonData.push(rowData);
                }
            });
            return jsonData;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async export(json: any, fileName: string, sheetName: string) {
        let rows = [];

        json.forEach((element) => {
            rows.push(Object.values(element));
        });

        const workbook = new excelJs.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);
        rows.unshift(Object.keys(json[0]));
        worksheet.addRows(rows);

        // Set the column widths
        worksheet.columns.forEach((column) => {
            let maxColumnLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxColumnLength) {
                    maxColumnLength = columnLength;
                }
            });
            column.width = maxColumnLength + 2;
        });

        let File = await new Promise((resolve, reject) => {
            tmp.file({ discardDescriptor: true, prefix: fileName, postfix: '.xlsx', mode: parseInt('0600', 8) }, async (err, file) => {
                if (err) {
                    reject(err);
                    throw new BadRequestException(err);
                }
                try {
                    await workbook.xlsx.writeFile(file);
                    resolve(file);
                } catch (error) {
                    reject(error);
                    throw new BadRequestException(error);
                }
            });
        });

        return File;
    }
}
