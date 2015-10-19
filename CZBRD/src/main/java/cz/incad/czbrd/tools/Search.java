/*
 * Copyright (C) 2013 Alberto Hernandez
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
package cz.incad.czbrd.tools;

import cz.incad.czbrd.Options;
import cz.incad.czbrd.IndexQuery;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Calendar;
import java.util.Iterator;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.http.HttpServletRequest;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.util.ClientUtils;
import org.apache.solr.common.util.DateUtil;

import org.apache.velocity.tools.config.DefaultKey;
import org.apache.velocity.tools.view.ViewToolContext;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
@DefaultKey("search")
public class Search {

    public static final Logger LOGGER = Logger.getLogger(Search.class.getName());

    private HttpServletRequest req;
    private Options opts;
    private boolean hasFilters = false;

    public void configure(Map props) {
        try {
            req = (HttpServletRequest) props.get("request");
            opts = Options.getInstance();
        } catch (IOException e) {
            LOGGER.log(Level.SEVERE, e.getMessage(), e);
        } catch (JSONException e) {
            LOGGER.log(Level.SEVERE, e.getMessage(), e);
        }
    }
    
    public String getAsCsv(){
        try{
            SolrQuery query = doQuery();
            JSONObject js = opts.getJSONObject("export");
            query.set("csv.header", js.getBoolean("header"));
            query.set("csv.encapsulator", js.getBoolean("encapsulator"));
            query.set("csv.escape", js.getBoolean("escape"));
            query.set("csv.separator", js.getBoolean("separator"));
            query.set("csv.newline", js.getBoolean("newline"));
            query.set("csv.null", js.getBoolean("null"));
            
            JSONArray arr = js.getJSONArray("fields");
            String[] ret = new String[arr.length()];
            for(int i = 0; i<arr.length(); i++){
                ret[i] = arr.getString(i);
            }      
            query.setFields(ret);
            
            return IndexQuery.csv(query);
        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, null, ex);
            return null;
        }
    }

    public String getAsXML() {
        try{
            return IndexQuery.xml(doQuery());
        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, null, ex);
            return null;
        }
    }

    public String getAsJSON() {
        try{
            return IndexQuery.json(doQuery());
        } catch (Exception ex) {
            LOGGER.log(Level.SEVERE, null, ex);
            return null;
        }
    }

    private SolrQuery doQuery() throws Exception {

            String q = req.getParameter("q");
            SolrQuery query = new SolrQuery();
            if (q == null || q.equals("")) {
                q = "*:*";
            }
            query.setQuery(q);
            query.set("q.op", "AND");
            query.setFacet(true);
            query.setStart(getStart());
            query.setRows(getRows());
            
            query.addFacetField(opts.getStrings("facets"));

            query.setFacetMinCount(1);
            
            JSONArray ranges = opts.getJSONArray("facet_ranges");
            for(int i=0; i< ranges.length(); i++){
                JSONObject r = ranges.getJSONObject(i);
                Number gap;
                if("float".equals(r.getString("type"))){
                    gap= r.getDouble("gap");
                }else{
                    gap= r.getInt("gap");
                }
                //{"field": "rokvydani", "start":1, "end":2015, "gap":100},
                query.addNumericRangeFacet(r.getString("field"),
                        r.getInt("start"),
                        r.getInt("end"),
                        gap);
            }
            
            
                                
            JSONArray dates = opts.getJSONArray("facet_dates");
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.YEAR, -1);
            for(int i=0; i< dates.length(); i++){
                JSONObject r = dates.getJSONObject(i);
                //{"field": "rokvydani", "start":1, "end":2015, "gap":100},
                query.addDateRangeFacet(r.getString("field"),
                        //cal.getTime(),
                        DateUtil.parseDate(r.getString("start")),
                        Calendar.getInstance().getTime(),
//                        DateUtil.parseDate(r.getString("end")),
                        r.getString("gap"));
            }

            JSONObject others = opts.getJSONObject("otherParams");
            if(others!= null){
                Iterator keys = others.keys();
                while (keys.hasNext()) {
                    String key = (String) keys.next();
                    Object val = others.get(key);
                    if (val instanceof Integer) {
                        query.set(key, (Integer) val);
                    } else if (val instanceof String) {
                        query.set(key, (String) val);
                    } else if (val instanceof Boolean) {
                        query.set(key, (Boolean) val);
                    }

                }
            }
            addFilters(query);
            return query;

    }

    private void addFilters(SolrQuery query) {
        if (req.getParameterValues("zdroj") != null) {
            for (String zdroj : req.getParameterValues("zdroj")) {
                if (zdroj.startsWith("-")) {
                    query.addFilterQuery("-zdroj:\"" + zdroj.substring(1) + "\"");
                } else {
                    query.addFilterQuery("zdroj:\"" + zdroj + "\"");
                }
            }
            hasFilters = true;
        }

        if (req.getParameterValues("ex") != null) {
            for (String ex : req.getParameterValues("ex")) {
                query.addFilterQuery("-" + ex);
            }
            hasFilters = true;
        }
        if (req.getParameterValues("fq") != null) {
            for (String fq : req.getParameterValues("fq")) {
                query.addFilterQuery(fq);
            }
            hasFilters = true;
        }

        if (req.getParameter("title") != null && !req.getParameter("title").equals("")) {
            query.addFilterQuery("title:" + req.getParameter("title"));
            hasFilters = true;
        }

        if (req.getParameter("author") != null && !req.getParameter("author").equals("")) {
            query.addFilterQuery("author:" + req.getParameter("author"));
            hasFilters = true;
        }

        if (req.getParameter("rok") != null && !req.getParameter("rok").equals("")) {
            query.addFilterQuery("rokvydani:" + req.getParameter("rok"));
            hasFilters = true;
        }

        if (req.getParameter("isbn") != null && !req.getParameter("isbn").equals("")) {
            query.addFilterQuery("isbn:" + req.getParameter("isbn") + "*");
            hasFilters = true;
        }

        if (req.getParameter("issn") != null && !req.getParameter("issn").equals("")) {
            query.addFilterQuery("issn:" + req.getParameter("issn") + "*");
            hasFilters = true;
        }

        if (req.getParameter("ccnb") != null && !req.getParameter("ccnb").equals("")) {
            query.addFilterQuery("ccnb:\"" + req.getParameter("ccnb") + "\"");
            hasFilters = true;
        }

        if (req.getParameter("vydavatel") != null && !req.getParameter("vydavatel").equals("")) {
            query.addFilterQuery("vydavatel:" + req.getParameter("vydavatel"));
            hasFilters = true;
        }

    }

    public boolean getHasFilters() {
        return hasFilters;
    }

    private int getStart() throws UnsupportedEncodingException {
        String start = req.getParameter("offset");
        if (start == null || start.equals("")) {
            start = "0";
        }
        return Integer.parseInt(start);
    }

    private int getRows() throws UnsupportedEncodingException {

        String rows = req.getParameter("rows");
        if (rows == null || rows.equals("")) {
            rows = "40";
        }
        return Integer.parseInt(rows);

    }

}
