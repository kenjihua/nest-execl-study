import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as xlsx from 'node-xlsx';

const path:string = "http://quotes.money.163.com/f10/zycwzb_600519.html#01c01'";

@Injectable()
export class AppService {
  async init(): Promise<String> {
    let res = await axios.get(path);
    const $ = cheerio.load(res.data);
    const table = $(".table_bg001").eq(0).find('tr');
    let trIndex = 0;

    table.map((i,ele) => {
      if ($(ele).text().trim() === '净利润(扣除非经常性损益后)(万元)') {
        trIndex = i;
      }
    })

    const scrtrs = $(".scr_table").find('tr');

    let data = [{
      name: 'sheet1', data: []
    }]

    scrtrs.map((index, el) => {
      if (index === 0 || index === trIndex) {
        let tableData = []
        $(el).find('td,th').map((j, item) => {
          tableData.push($(item).text())
        })
        data[0].data.push(tableData)
      }
    });

    let buf = xlsx.build(data);

    try {
      let isSuccess:String = await new Promise((resolve,reject) => {
        fs.writeFile("茅台净利润.xlsx", buf, "utf-8", (error) => {
          if (error == null) {
            reject("success");
          }else{
            reject("fail");
          }
        });
      });
      return isSuccess;
    } catch (error) {
      return error;
    }
  }
}
