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
        let rows = []

        json.forEach((element) => {
            rows.push(Object.values(element));
        });

        const workbook = new excelJs.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);
        rows.unshift(Object.keys(json[0]));
        worksheet.addRows(rows);

        let File = await new Promise((resolve, reject) => {
            tmp.file({ discardDescriptor: true, prefix: fileName, postfix: '.xlsx', mode: parseInt('0600', 8) }, async (err, file) => {
                if (err)
                    throw new BadRequestException(err)
                workbook.xlsx.writeFile(file).then(_ => {
                    resolve(file)
                }).catch(err => {
                    reject(err)
                    throw new BadRequestException(err)
                });

            });
        })

        return File;
    }
}
