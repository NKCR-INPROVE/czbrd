/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package cz.incad.czbrd;

import static cz.incad.czbrd.tools.Search.LOGGER;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.Charset;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.logging.Level;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.solr.client.solrj.SolrQuery;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author alberto.a.hernandez
 */
public class ExportServlet extends HttpServlet {

  /**
   * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
   * methods.
   *
   * @param request servlet request
   * @param response servlet response
   * @throws ServletException if a servlet-specific error occurs
   * @throws IOException if an I/O error occurs
   */
  protected void processRequest(HttpServletRequest request, HttpServletResponse response)
          throws ServletException, IOException {

    try {
      Options opts = Options.getInstance();
      SolrQuery query = IndexQuery.doQuery(request, 0, Integer.parseInt(request.getParameter("rows")));
      JSONObject js = opts.getJSONObject("export");
      query.set("csv.null", js.getString("null"));

      JSONArray arr = js.getJSONArray("fields");
      String[] ret = new String[arr.length()];
      for (int i = 0; i < arr.length(); i++) {
        ret[i] = arr.getString(i);
      }
      query.setFields(ret);
        query.set("csv.separator", ";");
        query.set("csv.header", "false");
        query.set("csv.mv.separator", "\n");

      String resp = IndexQuery.csv(query);

      //Adding header with query and filters info
      StringBuilder header = new StringBuilder();
      header.append("Použité filtry;;;;;Datum exportu;Čas;;;;").append("\n");

      SimpleDateFormat df = new SimpleDateFormat("dd/MM/yyyy;HH:mm");
      
      header.append("nalezeno: ")
              .append(request.getParameter("numFound"))
              .append(" knihovních jednotek;;;;;")
              .append(df.format(new Date()))
              .append(";;;;")
              .append(";;;;")
              .append("\n");

      ArrayList fqs = new ArrayList();
      for (String fq : query.getFilterQueries()) {
        if (!fqs.contains(fq)) {
          header.append(fq)
                  .append(";;;;;;;;;;").append("\n");
          fqs.add(fq);
        }
      }

      header.append(";;;;;;;;;;").append("\n")
              .append(";;;;;;;Informace z průzkumu;;;").append("\n")
              .append("Název;Čárový kód;Signatura;Autor;Rok;ČNB;Vlastník;Datum;Zásah;Poškození vazby;pH").append("\n");
      

      String content = header + resp;

      //response.setContentType("text/plain;charset=UTF-8");
      response.setContentType("text/csv;charset=UTF-8");
      response.setCharacterEncoding("UTF-8");
      response.setContentLength((int) content.length());
      response.setHeader("Content-Disposition", "attachment; filename=\"czbrd_export.csv\"");

      response.getWriter().print("\uFEFF");
      response.getWriter().println(content);

    } catch (Exception ex) {
      LOGGER.log(Level.SEVERE, null, ex);

    }

  }

  // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
  /**
   * Handles the HTTP <code>GET</code> method.
   *
   * @param request servlet request
   * @param response servlet response
   * @throws ServletException if a servlet-specific error occurs
   * @throws IOException if an I/O error occurs
   */
  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
          throws ServletException, IOException {
    processRequest(request, response);
  }

  /**
   * Handles the HTTP <code>POST</code> method.
   *
   * @param request servlet request
   * @param response servlet response
   * @throws ServletException if a servlet-specific error occurs
   * @throws IOException if an I/O error occurs
   */
  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
          throws ServletException, IOException {
    processRequest(request, response);
  }

  /**
   * Returns a short description of the servlet.
   *
   * @return a String containing servlet description
   */
  @Override
  public String getServletInfo() {
    return "Short description";
  }// </editor-fold>

}
