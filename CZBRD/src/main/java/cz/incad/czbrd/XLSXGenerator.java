package cz.incad.czbrd;

import java.io.IOException;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;

/**
 *
 * @author alberto
 */
public class XLSXGenerator {
  
  
   static SimpleDateFormat df = new SimpleDateFormat("dd/MM/yyyy");
   static SimpleDateFormat df2 = new SimpleDateFormat("HH:mm");

  static public void fromResults(SolrDocumentList docs, String[] columns, String numFound, ArrayList<String> fqs, OutputStream out) throws IOException {
    Workbook workbook = new XSSFWorkbook();
    Sheet sheet = workbook.createSheet("Results");

    Font headerFont = workbook.createFont();
    headerFont.setBold(true);

    //headerFont.setFontHeightInPoints((short) 14);
    CellStyle headerCellStyle = workbook.createCellStyle();
    headerCellStyle.setFont(headerFont);
    headerCellStyle.setWrapText(true);
    CellStyle cellStyle = workbook.createCellStyle();
    cellStyle.setShrinkToFit(true);
    cellStyle.setWrapText(true);
    cellStyle.setVerticalAlignment(VerticalAlignment.TOP);

    int rowNum = addHeader(sheet, headerCellStyle, numFound, fqs) + 1;

    // Create a Row
    Row headerRow = sheet.createRow(rowNum++);
    String[] fields = new String[]{"Název", "Čárový kód", "Signatura", "Autor", "Rok", "ČNB", "Vlastník", "Datum", "Zásah", "Poškození vazby", "pH"};
    for (int i = 0; i < fields.length; i++) {
      Cell cell = headerRow.createCell(i);
      cell.setCellValue(fields[i]);
      cell.setCellStyle(headerCellStyle);

      sheet.autoSizeColumn(i);
    }

    for (SolrDocument doc : docs) {

      int rows = 0;
      Row row = sheet.createRow(rowNum++);
      for (int i = 0; i < columns.length; i++) {
        if (doc.getFieldValue(columns[i]) != null) {
          Collection vals = doc.getFieldValues(columns[i]);
          String val = "";

          for (Object v : vals) {
            if (v != null) {
              if (v instanceof Date) {
                val += df.format(v) + " \r\n";
              } else {
                val += v.toString() + " \r\n";
              }
            }
          }
          Cell c = row.createCell(i);
          c.setCellValue(val);
          c.setCellStyle(cellStyle);
          rows = Math.max(rows, vals.size());
        }
      }
      row.setHeight((short) -1);
      //row.setRowStyle(cellStyle);
      row.setHeightInPoints((short) (rows * sheet.getDefaultRowHeightInPoints()));

    }
    for (int i = 1; i < fields.length; i++) {
      sheet.autoSizeColumn(i);
    }
    workbook.write(out);
  }

  static private int addHeader(Sheet sheet, CellStyle headerCellStyle, String numFound, ArrayList<String> fqs) {
    int rows = 0;
    Row headerRow = sheet.createRow(rows++);
    headerRow.setRowStyle(headerCellStyle);
    headerRow.createCell(0).setCellValue("Použité filtry");
    headerRow.createCell(6).setCellValue("Datum");
    headerRow.createCell(7).setCellValue("Čas");

    Date d = new Date();
    Row qRow = sheet.createRow(rows++);
    qRow.createCell(0).setCellValue("nalezeno: " + numFound + " knihovních jednotek");
    qRow.createCell(6).setCellValue(df.format(d));
    qRow.createCell(7).setCellValue(df2.format(d));

    for (String fq : fqs) {
      sheet.createRow(rows++).createCell(0).setCellValue(fq);
    }

    return rows;
  }

}
