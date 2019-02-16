package cz.incad.czbrd;


import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Calendar;
import java.util.Iterator;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.io.IOUtils;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.impl.HttpSolrServer;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.client.solrj.util.ClientUtils;
import org.apache.solr.common.SolrDocumentList;
import org.apache.solr.common.util.DateUtil;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author alberto
 */
public class IndexQuery {

    public static SolrServer getServer() throws IOException {
        Options opts = Options.getInstance();
        HttpSolrServer server = new HttpSolrServer(String.format("%s/%s/", 
                opts.getString("solrHost", "http://localhost:8080/solr"), 
                opts.getString("solrCore", "czbrd")));
        server.setMaxRetries(1); // defaults to 0.  > 1 not recommended.
        server.setConnectionTimeout(5000); // 5 seconds to establish TCP
        
        // The following settings are provided here for completeness.
        // They will not normally be required, and should only be used 
        // after consulting javadocs to know whether they are truly required.
        server.setSoTimeout(1000);  // socket read timeout
        server.setDefaultMaxConnectionsPerHost(100);
        server.setMaxTotalConnections(100);
        server.setFollowRedirects(false);  // defaults to false
        
        // allowCompression defaults to false.
        // Server side must support gzip or deflate for this to have any effect.
        server.setAllowCompression(true);
        return server;
    }
    public static SolrDocumentList query(SolrQuery query) throws SolrServerException, IOException {
        SolrServer server = getServer();
        QueryResponse rsp = server.query(query);
        return rsp.getResults();
    }

    public static SolrDocumentList queryOneField(String q, String[] fields, String[] fq) throws SolrServerException, IOException {
        SolrServer server = getServer();
        SolrQuery query = new SolrQuery();
        query.setQuery(q);
        query.setFilterQueries(fq);
        query.setFields(fields);
        query.setRows(100);
        QueryResponse rsp = server.query(query);
        return rsp.getResults();
    }
    
    public static String xml(String q) throws MalformedURLException, IOException {
        SolrQuery query = new SolrQuery(q);
        query.set("indent", true);

        return xml(query);
    }
    
    private static String doQuery(SolrQuery query) throws MalformedURLException, IOException {
        

        // use org.apache.solr.client.solrj.util.ClientUtils 
        // to make a URL compatible query string of your SolrQuery
        String urlQueryString = ClientUtils.toQueryString(query, false);
        Options opts = Options.getInstance();
        String solrURL = String.format("%s/%s/select",
                opts.getString("solrHost", "http://localhost:8080/solr"),
                opts.getString("solrCore", "czbrd"));
        URL url = new URL(solrURL + urlQueryString);

        // use org.apache.commons.io.IOUtils to do the http handling for you
        String xmlResponse = IOUtils.toString(url, "UTF-8");

        return xmlResponse;
    }
    
    public static String csv(SolrQuery query) throws MalformedURLException, IOException {
        
        query.set("wt", "csv");
        return doQuery(query);
    }
    public static String xml(SolrQuery query) throws MalformedURLException, IOException {
        
        query.set("indent", true);
        query.set("wt", "xml");
        return doQuery(query);
    }
    
    
    
    public static String json(SolrQuery query) throws MalformedURLException, IOException {
        
        query.set("indent", true);
        query.set("wt", "json");
        return doQuery(query);
    }
    
    
    
    public static String json(String urlQueryString) throws MalformedURLException, IOException {
        
        Options opts = Options.getInstance();
        String solrURL = String.format("%s/%s/select",
                opts.getString("solrHost", "http://localhost:8080/solr"),
                opts.getString("solrCore", "czbrd"));
        URL url = new URL(solrURL + "?" + urlQueryString);

        // use org.apache.commons.io.IOUtils to do the http handling for you
        String xmlResponse = IOUtils.toString(url, "UTF-8");

        return xmlResponse;
    }
    
    public static void addFilters(SolrQuery query, HttpServletRequest req) {
        if (req.getParameterValues("zdroj") != null) {
            for (String zdroj : req.getParameterValues("zdroj")) {
                if (zdroj.startsWith("-")) {
                    query.addFilterQuery("-zdroj:\"" + zdroj.substring(1) + "\"");
                } else {
                    query.addFilterQuery("zdroj:\"" + zdroj + "\"");
                }
            }
        }

        if (req.getParameterValues("ex") != null) {
            for (String ex : req.getParameterValues("ex")) {
                query.addFilterQuery("-" + ex);
            }
        }
        if (req.getParameterValues("fq") != null) {
            for (String fq : req.getParameterValues("fq")) {
                //query.add("fq", "{!tag=ff_"+fq.split(":")[0]+"}"+fq);
                query.addFilterQuery(fq);
            }
        }

    }
    
    public static SolrQuery doQuery(HttpServletRequest req1, int start, int rows) throws Exception {

      Options opts = Options.getInstance();
            String q = req1.getParameter("q");
            SolrQuery query = new SolrQuery();
            if (q == null || q.equals("")) {
                q = "*:*";
            }
            query.setQuery(q);
            query.set("q.op", "AND");
            query.setFacet(true);
            query.setStart(start);
            query.setRows(rows);
            String order = req1.getParameter("order");
            if (order != null && order.equals("desc")) {
              query.setSort("mer_akt_KBLOKPH", SolrQuery.ORDER.desc);
            }else{
              query.setSort("mer_akt_KBLOKPH", SolrQuery.ORDER.asc);
            }
            query.addSort("score", SolrQuery.ORDER.desc);
            for(String f:opts.getStrings("facets")){
                //fq={!tag=dt}doctype:pdf&facet=true&facet.field={!ex=dt}doctype
                //query.add("facet.field", "{!ex=ff_"+f+"}"+f);
                query.add("facet.field", f);
                
                if (req1.getParameterValues(f) != null) {
                    String v = "";
                    String[] vals = req1.getParameterValues(f);
                    for (int i = 0; i<vals.length - 1; i++) {
                        v += vals[i] + " OR ";
                    }
                    v += vals[vals.length -1];
                    //query.add("fq", "{!tag=ff_"+f+"}"+f+":"+v);
                    query.add("fq", f+":"+v);
                }   
            }

            //query.setFacetMinCount(1);
            query.setFacetMinCount(0);
            
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
            addFilters(query, req1);
            return query;

    }


}
