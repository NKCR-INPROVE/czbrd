

/* global czbrd, _ */

function CZBRD() {
    this.facetMaxChars = 28;
    this.init();
}
CZBRD.prototype = {
    init: function () {
        this.recreateFacets = true;
        this.isHome = true;
        this.isInfo = false;
        this.phColors = ['#ba212b', '#ea4230', '#f36600', '#f29500', '#f7b019', '#f3db00',
            '#87b807', '#4ab333', '#34a9e8', '#1875c2', '#283795', '#242066', '#632c97', '#8e2694'];
        this.charts = [];
        this.usedFilters = [];
    $(document).ready(function(){
      $('.modal').modal();
    });

    },
    setDict: function (dict) {
        this.dict = dict;
    },
    localize: function (key) {
        if (this.dict.hasOwnProperty(key)) {
            return this.dict[key];
        } else {
            return key;
        }
    },
    goHome: function () {
        window.location.href= ".";
//      if(this.isInfo){
//      }
//        this.recreateFacets = true;
//        this.isHome = true;
//        $("#q").val('');
//        $("#searchForm>input.filter").remove();
//        $(".results_header").hide();
//        $("#home").show();
//        $("#content").hide();
//        //this.search();
    },
    clearDisplay: function(){
        //$("#content").hide();
        if(this.isHome){
            $("#home").show();
        }else{
            $("#home").hide();
        }
        if(this.isInfo){
            $("#info").show();
        }else{
            $("#info").hide();
        }
        
            
    },
    doFacets: function (facets) {
        if(!this.recreateFacets){
            //return;
        }
        $("#rokBars").remove();
        $("#facets").remove();
        if (this.isHome) {
            $("#home").show();
            var h = $("#footer").position().top - $("#header").height() - $("#home .intro").height() - 40;
            $("#home .charts").height(h);
            $("#home .rokBars").append('<div id="rokBars" class="chart"></div>');
            this.rokChart(facets);
            this.typChart(facets);
            this.materialChart(facets);
            this.papirChart(facets);
            //Vynechat grafy Druh zásahu a Typ tisku
            //this.tiskChart(facets);
            this.vazbaChart(facets);
        } else if (!this.isInfo) {
            $("#home").hide();
            $("#results .rokBars").append('<div id="rokBars" class="chart"></div>');
            this.rokChart(facets);

            $("#facets_cont").append('<div id="facets"></div>');

            this.doPHChart(facets);

             var dates = facets.facet_ranges.mer_RECCREDATE.counts;
             this.rangeDateSlider(dates, "mer_RECCREDATE", "mer_RECCREDATE", true);

            for (var facet in facets.facet_fields) {
                var facetvals = facets.facet_fields[facet];
                if (facetvals.length < 3)
                    continue;
                $("#facets").append("<div class=\"title\">" + this.localize(facet) + "</div>");
                var fdiv = $("<div/>", {class: 'box'});
                var ul = $("<ul/>", {class: facet});
                for (var i = 0; i < facetvals.length; i = i + 2) {
                    if (facetvals[i] !== "null") {
                        var li = $("<li/>", {class: "link"});
                        li.data("facet", facet);
                        li.data("value", facetvals[i]);
                        li.attr("data-value", facetvals[i]);
                        if(facet === 'mer_akt_POSDESKY' || facet === 'mer_akt_POSHRBETNIK'){
                            li.attr('title', this.localize(facet + '.' + facetvals[i]));
                        }

//                        var plus = $("<span/>", {class: "plus", title: "Přidat položku"});
//                        plus.text('+');
//                        plus.button();
                        var plus = $("<input/>", {type: "checkbox", class: "plus", title: "Přidat položku"});
                        //plus.data('val', facetvals[i]);
                        if($('#searchForm :input.'+facet+'[value="\"'+facetvals[i]+'\""]').length > 0){
                            plus.attr("checked", true);
                            plus.click(function () {
                                $('#searchForm :input.'+$(this).parent().data("facet")+'[value="\"'+$(this).parent().data("value")+'\""]').remove();
                                czbrd.search();
                            });
                        }else{
                            plus.click(function () {
                                czbrd.toggleFilter($(this).parent().data("facet"), '"' + $(this).parent().data("value") + '"');
                            });
                        }
                        
                        

                        li.append(plus);

/*
                        var minus = $("<span/>", {class: "plus", title: "Odebrat položku"});
                        minus.text('-');
                        minus.button();
                        minus.click(function () {
                            czbrd.addExFilter($(this).parent().data("facet"), '"' + $(this).parent().data("value") + '"');
                        });
                        li.append(minus);
*/
                        var label = $("<span/>");
                        var txt = facetvals[i];
                        
                        if(facet === 'mer_akt_POSDESKY' || facet === 'mer_akt_POSHRBETNIK'){
                            txt = this.localize(facet + '.' + facetvals[i]);
                        }
                        if(txt.length > this.facetMaxChars){
                            label.attr("title", txt);
                            txt = txt.substring(0, this.facetMaxChars-1) + "...";
                        }
                        label.text(txt + " (" + facetvals[i + 1] + ")");
                        label.click(function () {
                            
                            czbrd.toggleFilter($(this).parent().data("facet"), '"' + $(this).parent().data("value") + '"');
                        });
                        li.append(label);

                        ul.append(li);
                    }
                }

                fdiv.append(ul);
                $("#facets").append(fdiv);
            }


//            $("#facets").accordion({
//                heightStyle: "content"
//            });

        }

    },
    rangeDateSlider: function (dates, id, field) {
        var rangeSlider = $('<div/>', {id: 'rangeSlider'});
        $("#facets").append(rangeSlider);
        rangeSlider.append("<div class=\"title\">" + this.localize(field) + "</div>");
        var fdata = $('<div/>');
        rangeSlider.append(fdata);

        var min_date = new Date(dates[0]);
        var minv = $.formatDateTime('dd.mm.y', min_date);

        var max_date = new Date(dates[dates.length - 2]);
        var maxv = $.formatDateTime('dd.mm.y', max_date);

        var i_years = max_date.getFullYear() - min_date.getFullYear();

        var mini = 0;
        var maxi = i_years * 12;
        
        var ifrom = mini;
        var ito = maxi;
        
        var slider = $('<div/>', {id: id + '_range', class: 'range'});
        var sel = $('<div/>', {id: id + '_select', class: 'select', 'data-from': '', 'data-to': ''});
        sel.append('<span class="label">od ' + minv + ' - do ' + maxv + '</span>');
        
        sel.append('<a id="slider_do" href="#" style="float:right;"><i class="tiny material-icons right">arrow_forward</i></a>');
        if ($("#searchForm>input.mer_RECCREDATE").length > 0) {
          
          var val = $("#searchForm>input.mer_RECCREDATE").val();
          var parts = val.replace(' TO ', '|').replace('[', '').replace(']', '').split("|");
          ifrom = dates.findIndex(d => d.split && d.split("T")[0] === parts[0].split("T")[0]) / 2;
          ito = dates.findIndex(d => d.split && d.split("T")[0] === parts[1].split("T")[0]) / 2;
          
          var fdate = new Date(parts[0]);
          var from = $.formatDateTime('dd.mm.y', fdate);

          var todate = new Date(parts[1]);
          var to = $.formatDateTime('dd.mm.y', todate);

          $(sel).find("span.label").html("od " + from + " - do " + to);
          $(sel).data("from", $.formatDateTime('yy-mm-dd', fdate));
          $(sel).data("to", $.formatDateTime('yy-mm-dd', todate));
        }


        fdata.append(sel);
        fdata.append(slider);

        noUiSlider.create(slider[0], {
          start: [ifrom, ito],
          connect: true,
          tooltips: [false, false],
          step: 1,
          orientation: 'horizontal', // 'horizontal' or 'vertical'
          range: {
            'min': mini,
            'max': maxi
          }
         });
         
         slider[0].noUiSlider.on('slide', function (values, handle, unencoded, tap, positions, noUiSlider) { 
           var fdate = new Date(dates[0]);
          fdate.setMonth(fdate.getMonth() + values[ 0 ]);
          var from = $.formatDateTime('dd.mm.y', fdate);

          var todate = new Date(dates[0]);
          todate.setMonth(todate.getMonth() + values[1]);
          var to = $.formatDateTime('dd.mm.y', todate);

          $(sel).find("span.label").html("od " + from + " - do " + to);
          $(sel).data("from", $.formatDateTime('yy-mm-dd', fdate));
          $(sel).data("to", $.formatDateTime('yy-mm-dd', todate));
         });
         
        $("#slider_do").click(function () {
            var value = "[" + $(sel).data("from") + "T00:00:00Z TO " + $(sel).data("to") + "T00:00:00Z]";
            czbrd.addFilter(field, value);
        });
    },
    rangeDateFilter: function (dates, id, field) {

        $("#facets").append("<div class=\"title\">" + this.localize(field) + "</div>");
        var fdata = $('<div/>');
        $("#facets").append(fdata);

        var min_date = new Date(dates[0]);
        var minv = $.formatDateTime('dd.mm.y', min_date);

        var max_date = new Date(dates[dates.length - 2]);
        var maxv = $.formatDateTime('dd.mm.y', max_date);

        var i_years = max_date.getFullYear() - min_date.getFullYear();

        var mini = 0;
        var maxi = i_years * 12;

        var slider = $('<div/>', {id: id + '_range', class: 'range'});
        var sel = $('<div/>', {id: id + '_select', class: 'select', 'data-from': '', 'data-to': ''});

        sel.append('<span class="label">od ' + minv + ' - do ' + maxv + '</span>');
        sel.append('<span class="go" style="float:right;">go</span>');

        fdata.append(sel);
        fdata.append(slider);

        $('#' + id + '_range').slider({
            range: true,
            min: mini,
            max: maxi,
            values: [mini, maxi],
            slide: function (event, ui) {
                var fdate = new Date(dates[0]);
                fdate.setMonth(fdate.getMonth() + ui.values[ 0 ]);
                var from = $.formatDateTime('dd.mm.y', fdate);

                var todate = new Date(dates[0]);
                todate.setMonth(todate.getMonth() + ui.values[1]);
                var to = $.formatDateTime('dd.mm.y', todate);

                $(sel).find("span.label").html("od " + from + " - do " + to);
                $(sel).data("from", $.formatDateTime('yy-mm-dd', fdate));
                $(sel).data("to", $.formatDateTime('yy-mm-dd', todate));
            }
        });
        $(sel).find("span.go").button({
            icons: {
                primary: "ui-icon-arrowthick-1-e"
            },
            text: false
        });
        $(sel).find("span.go").click(function () {
            var value = "[" + $(sel).data("from") + "T00:00:00Z TO " + $(sel).data("to") + "T00:00:00Z]";
            czbrd.addFilter(field, value);
        });
    },
    setUsedFilters: function () {
        var hasFilters = false;
        this.usedFilters = [];
        $("#used_filters").html('');
        hasFilters = $("#searchForm>input.filter").length > 0 || $('#q').val() !== '';
        if (hasFilters) {
            $("#used_filters").append("<div class=\"title\">Filtry</div>");
            if ($('#q').val() !== '') {
                var li = $("<button/>", {class: "btn-small waves-effect waves-light"});
                li.text($('#q').val());
                li.click(function () {
                    $('#q').val('');
                    czbrd.search();
                });
                $("#used_filters").append(li);
                this.usedFilters.push({field:"q", value: $('#q').val()});
            }


            $('#facets input.plus').prop("checked", false);
            $("#searchForm>input.filter").each(_.partial(function (c) {
                var id = $(this).attr("id");
                var name = $(this).attr("name");
                var field = $(this).val().split(":")[0];
                var val = $(this).val();
                if (name === "ex") {
                    val = "není " + val.split(":")[1];
                }
                var li = $("<button/>", {class: "btn-small waves-effect waves-light"});
                var t = czbrd.localize(name) + ": " + val.replace(' TO ', ' - ').replace('[', '').replace(']', '');
                if (name === 'mer_RECCREDATE') {
                  var parts = val.replace(' TO ', '|').replace('[', '').replace(']', '').split("|");
                  var from = $.formatDateTime('dd.mm.yy', new Date(parts[0]));
                  var to = $.formatDateTime('dd.mm.yy', new Date(parts[1]));
                  t = czbrd.localize(name) + ": " + from + " - " + to;
                }
                li.text(t);
                li.click(function () {
                    $("#" + id).remove();
                    czbrd.search();
                });
                $("#used_filters").append(li);
                if (name === 'mer_RECCREDATE') {
                  c.usedFilters.push({id: id, field: name, value: val});
                } else if (name!=='rokvydani' && name!=='mer_akt_KBLOKPH'){
                  c.usedFilters.push({id: id, field: name, value: val});
                  $('#facets ul.'+name+' li[data-value='+$(this).val()+'] input.plus').prop("checked", true);
                }
            }, this));
        }
    },
    setOffset: function (offset) {
        $("#offset").val(offset);
        this.isHome = false;
        this.recreateFacets = false;
        this.search();
    },
    changeOrder: function(){
        var order = $("#order").val();
        if (order === null || order === "" || order === "asc"){ 
            order = 'desc';
            $('.sort-order').text(this.localize('order.desc'));
          }else{
            order = 'asc';
            $('.sort-order').text(this.localize('order.asc'));
          }
        $("#offset").val(0);
        $("#order").val(order);
        this.recreateFacets = false;
        this.isHome = false;
        this.search();
    },
    setPagination: function (numFound) {
        var maxChunks = 5;
        var rows = parseInt($("#rows").val());
        var offset = parseInt($("#offset").val());
        $(".pagination").html("");
        
        var curPage = Math.floor(offset/rows) + 1;
        var totalPages = Math.ceil(numFound / rows);
        var startPage = Math.max(1, curPage - 2);
        var endPage = Math.min(totalPages, startPage + maxChunks - 1);
        
        if (offset > 0) {
            var prev = $("<span/>", {class: "link"});
            prev.text("1");
            prev.click(_.bind(function () {
                this.setOffset(0);
            }, this));
            $(".pagination").append(prev);
            $(".pagination").append("<span>...</span>");
        }
        //var cur = $("<span/>");
        //cur.text(" od " + (offset + 1) + " do " + Math.min(offset + rows, numFound) + " ");
        //$(".pagination").append(cur);
        
        
        for(var i = startPage; i<= endPage; i++){
            var cur = $("<span/>", {class: "link"});
            cur.data('page', i);
            cur.text(i + "");
            if(i === curPage){
                cur.addClass('active');
            }
            cur.click(_.partial(function (c) {
                c.setOffset(($(this).data('page') -1) * rows);
            }, this));
            $(".pagination").append(cur);
            if(i < endPage){
                $(".pagination").append($("<span>|</span>"));
            }
        }
        
        
        if (offset + rows < numFound) {
            var next = $("<span/>", {class: "link"});
            next.text((totalPages - 1));
            next.click(_.bind(function () {
                this.setOffset((totalPages - 1) * rows);
            }, this));
            $(".pagination").append("<span>...</span>");
            $(".pagination").append(next);
        }
    },
    doResults: function (response) {
        
        $("#result_docs").html("");
        $(".results_header").show();
        var numFound = response.numFound;
        $("span.numFound").text(numFound);
        this.setPagination(numFound);
        if (this.isHome || this.isInfo){
            $("#content").hide();
            return;
        }
        $("#content").show();
        this.setUsedFilters();
        for (var i in response.docs) {
            var doc = response.docs[i];
            var res_id = doc.id;
            //var rowDiv = $("<div/>", {class: "res card"});
            //var colDiv = $("<div/>", {class: "col s12"});
            //rowDiv.append(colDiv);
            var fdiv = $("<div/>", {class: "res card"});
            //colDiv.append(fdiv);

            var div = $("<div/>", {class: "card-title link title"});
            div.html(doc.ex_BIBNAZEV);
            fdiv.append(div);

            if (doc.hasOwnProperty("ex_BIBCARKOD") || doc.hasOwnProperty("ex_BIBSIGNATURA")) {
                div = $("<div/>");
                var text = "";
                if (doc.hasOwnProperty("ex_BIBCARKOD")) {
                    text = "<label>Čárový kód:</label><span>" + doc.ex_BIBCARKOD + "</span>";
                }
                if (doc.hasOwnProperty("ex_BIBSIGNATURA")) {
                    text += " <label>Signatura:</label><span>" + doc.ex_BIBSIGNATURA + "</span>";
                }
                div.html(text);
                fdiv.append(div);
            }

            this.addFieldToRes(doc, fdiv, "ex_BIBAUTOR");
            this.addFieldToRes(doc, fdiv, "ex_BIBROKVYDANI");
            this.addFieldToRes(doc, fdiv, "ex_BIBCNB");
            this.addFieldToRes(doc, fdiv, "ex_CORGANIZATION");


            //div = $("<div/>", {class: 'ev ev_akt', id: "res" + res_id + "_p"});
            var tab_ev = $("<table/>", {class: 'ev ev_akt', id: "res" + res_id + "_p"});
            var tr = $('<tr/>');
            tab_ev.append(tr);
            tr.append('<td title="' + this.localize('mer_RECCREDATE') + '">' + $.formatDateTime('dd.mm.yy', new Date(doc.mer_akt_RECCREDATE)) + "</td> ");
            tr.append('<td title="' + this.localize('mer_DRUHZASAHU_human') + '">| ' + doc.mer_akt_DRUHZASAHU_human + "</td>");
            tr.append('<td title="' + this.localize('mer_POSVAZBA_human') + '">| ' + doc.mer_akt_POSVAZBA_human + " </td><td> | </td>");
            var td_ph = $("<td/>", {width: 54, 'align': 'center'});
            var span_ph = $("<span/>");
            span_ph.text("pH " + doc.mer_akt_KBLOKPH);
            span_ph.css("background-color", this.phColors[Math.round(doc.mer_akt_KBLOKPH) - 1]);
            td_ph.append(span_ph);
            tr.append(td_ph);
            fdiv.append(tab_ev);

            var plustd = $("<td/>");

            if (doc.mer_RECCREDATE.length > 1) {
                var plus = $("<span/>", {class: "plus btn-small waves-effect waves-light", title: this.localize("showHistorie")});
                plus.text("+");
                plus.data("id", res_id);
                // plus.button();
                var his = $("<table/>", {class: "his_ev", id: "res" + res_id});
                plustd.append(plus);

                var rows = [];
                for (var ev = 0; ev < doc.mer_RECCREDATE.length; ev++) {
                    rows.push(this.addEvRow(his, doc, ev, res_id));

                }

                rows = _.sortBy(rows, function (num) {
                    var d = num.data("date");
                    return -d;
                });
                for (var idx = 0; idx < rows.length; idx++) {
                    his.append(rows[idx]);
                    //this.addEvRow(his, doc, ev, res_id);
                }
                fdiv.append(his);

                plus.click(function () {
                    var id = "#res" + $(this).data("id");
                    var of_id = id + "_p";
                    $(id).show();
                    $(id).width($(of_id).width() + 2);
                    $(id).position({
                        of: of_id,
                        my: "left top",
                        at: "left top"
                    });
                });
            }

            tr.append(plustd);

            div = $("<div/>", {class: 'clear'});
            fdiv.append(div);

             $("#result_docs").append(fdiv);
            //$("#result_docs").append(rowDiv);
            
        }
    },
    addEvRow: function (obj, doc, idx, res_id) {
        var tr = $("<tr/>", {class: 'ev'});
        var d = new Date(doc.mer_RECCREDATE[idx]);
        tr.data("date", d);
        tr.append('<td title="' + this.localize('mer_RECCREDATE') + '">' + $.formatDateTime('dd.mm.yy', d) + "</td> ");
        var l = doc.mer_DRUHZASAHU_human[idx];
        if (l === "null") {
            l = "neuvedeno";
        }
        tr.append('<td title="' + this.localize('mer_DRUHZASAHU_human') + '">| ' + l + "</td>");
        l = doc.mer_POSVAZBA_human[idx];
        if (l === "null") {
            l = "neuvedeno";
        }
        tr.append('<td title="' + this.localize('mer_POSVAZBA_human') + '">| ' + l + " </td><td> | </td>");
        
        var td_ph = $("<td/>", {width: 54, 'align': 'center'});
        var span_ph = $("<span/>");
            
        if(doc.hasOwnProperty("mer_KBLOKPH")){
            span_ph.text("pH " + doc.mer_KBLOKPH[idx]);
            span_ph.css("background-color", this.phColors[Math.round(doc.mer_KBLOKPH[idx]) - 1]);
        }else{
            span_ph.text("neuvedeno");
        }
        td_ph.append(span_ph);
        tr.append(td_ph);
        var minustd = $("<td/>");
        var minus = $("<span/>", {class: "plus btn-small waves-effect waves-light"});
        minus.data("id", res_id);
        if (idx === 0) {
            minus.text('-');
            // minus.button();
            minus.click(function () {
                var id = "#res" + $(this).data("id");
                $(id).hide();
            });
        } else {
            minus.addClass("hidden");
        }
        minustd.append(minus);
        tr.append(minustd);
        return tr;
    },
    addFieldToRes: function (doc, parent, field) {
        if (doc.hasOwnProperty(field)) {
            var div = $("<div/>");
            div.html("<label>" + this.localize(field) + ":</label><span>" + doc[field] + "</span>");
            parent.append(div);
        }
    },
    doSearch: function () {
        this.recreateFacets = true;
        this.isHome = false;
        this.isInfo = false;
        
        $("#info").hide();
        this.search();
        return false;
    },
    export: function(){
        var url = 'export?' + $("#searchForm").serialize() + '&numFound=' + $("span.numFound:first").text();
        $("#searchForm>input.filter").each(function () {
                var field = $(this).attr("name");
                var val = $(this).val();
                url += "&fq=" + field + ':' + encodeURI(val) + '';
            });
        window.open(url, "csv");
    },
    showLink: function () {
      var url = window.location.href;
        var ask = url.indexOf('?');
      if (ask > -1) {
          url = url.substring(0, url.indexOf('?'));
      }
      var params = $("#searchForm").serialize();
      
      $("#searchForm>input.filter").each(function () {
          var field = $(this).attr("name");
          var val = $(this).val();
          params += "&fq=" + field + ':' + encodeURI(val) + '';
      });
            
      url += '?' + params;
            
      $('.modal .content').text(url);
      $('.modal .content').attr('href', url);
      $('.modal').modal('open');
    },
    showURL: function () {
        if ($('#linkDialog').length === 0) {
            var l = $('<div>', {id: 'linkDialog', title: 'url'});
            $('body').append(l);

        }
        var url = window.location.href;
        var ask = url.indexOf('?');
        if (ask > -1) {
            url = url.substring(0, url.indexOf('?'));
        }
        url += '?' + $("#searchForm").serialize();

        $('#linkDialog').html('<span style="word-break: break-all;">' + url + '</span>');
        $('#linkDialog').dialog({
            width: '400', 
            position: { my: "center top", at: "center top+120", of: window }
        });
    },
    search: function () {
        this.clearDisplay();
        //$('body').addClass('progress');
        //$('#main').addClass('progress');
        $("#result_docs").html("");
        
        var params = $("#searchForm").serialize();
        
        
        $("#searchForm>input.filter").each(function () {
                var field = $(this).attr("name");
                var val = $(this).val();
                params += "&fq=" + field + ':' + encodeURI(val) + '';
            });
            
            
        
        $(document).scrollTop(0);
        $.getJSON("search.vm", params, _.bind(function (resp) {
            if (resp.hasOwnProperty("error")) {
                alert(resp.error);
            } else {
                $("#result_docs").html("");

                //$("#facets").html("");
                this.resp = resp;
                

                this.doResults(resp.response);
                if(this.resp.response.numFound > 1){
                    $(".charts").show();
                    this.doFacets(resp.facet_counts);
                    this.phActual();
                    /* Issue 67
                     * Vynechat grafy Druh zásahu a Typ tisku
                    this.dzChart();
                    this.chartOdkyselovani();
                    */
                }else{
                    $(".charts").hide();
                }
            }

            $('body').removeClass('progress');
            $('#main').removeClass('progress');
        }, this));
    },
    toggleFilter:function (field, value) {
        var exists = false;
        for(var i=0; i< this.usedFilters.length; i++){
            if(this.usedFilters[i].field === field && this.usedFilters[i].value === value){
                $("#" + this.usedFilters[i].id).remove();
                exists = true;
                break;
            }
        }
        if(!exists){
            this.addFilter(field, value);
        }else{
            this.recreateFacets = false;
            this.search();
        }
    },
    addFilter: function (field, value) {
      
        //if ($("#searchForm>input." + field).length === 0) {
            var index = $("#searchForm>input.filter").length + 1;
            var input = $('<input name="' + field + '" type="hidden" class="filter ' + field + '" />');
            $(input).attr("id", "fq_" + index);
            //input.val(field + ":" + value);
            input.val(value);
            $("#searchForm").append(input);
        //} else {
        //    $("#searchForm>input." + field).val(field + ":" + value);
        //}
        this.recreateFacets = this.isHome;
        this.isHome = false;
        $("#offset").val(0);
        this.search();
    },
    addExFilter: function (field, value) {
        if ($("#searchForm>input." + field).length === 0) {
            var index = $("#searchForm>input[name='ex']").length + 1;
            var input = $('<input name="ex" type="hidden" class="filter ' + field + '" />');
            $(input).attr("id", "ex_" + index);
            input.val(field + ":" + value);
            $("#searchForm").append(input);
        } else {
            var val = $("#searchForm>input." + field).val();
            var newval = field + ":" + value;
            if(val !== newval){
                var index = $("#searchForm>input[name='ex']").length + 1;
                var input = $('<input name="ex" type="hidden" class="filter ' + field + '" />');
                $(input).attr("id", "ex_" + index);
                input.val(field + ":" + value);
                $("#searchForm").append(input);
            }
            //$("#searchForm>input." + field).val(newval);
        }
        this.isHome = false;
        $("#offset").val(0);
        this.search();
    },
    getColumnLocation: function (plot, x, length) {
        // Get the width of the graph area minus the space taken up with axises.
        var insidewidth = plot.grid._width;
        var colwidth = insidewidth / length;
        var column = parseInt(x / colwidth);

        return column;
    },
    rokChart: function (facets) {
        var facet = facets.facet_ranges.rokvydani.counts;
        $("#rokBars").html("");
        if (facet.length > 2) {
            var counts = [];
            var values = [];
            for (var i = 0; i < facet.length; i = i + 2) {
                var from = parseInt(facet[i]);
                var to = from + 10;
                //values.push("" + from + " - " + to + "");
                if (from % 50 === 0) {
                    values.push(from + "");
                } else {
//                    values.push(from + "");
                    values.push(" ");
                }
                counts.push(parseInt(facet[i + 1]));
            }
            
            var title_loc = this.isHome ? "center" : "right";
            var fsize = this.isHome ? "1.2em" : ".8em";
            this.charts['rokChart'] = $.jqplot("rokBars", [counts], {
                title: {
                    "text": "Rok vydání&nbsp;&nbsp;&nbsp;&nbsp;",
                    "textAlign": title_loc,
                    'fontSize': fsize
                },
                tooltipFormatString: 'rok %.4P',
                seriesColors: ["#26a69a"],
                seriesDefaults: {
                    renderer: $.jqplot.BarRenderer,
                    
                    //pointLabels: {show: true, location: 'n', edgeTolerance: 0},
                    rendererOptions: {
                        fillToZero: false,
                        barMargin: .5}
                },
                cursor: {
                    followMouse: true,
                    show: true,
                    dblClickReset: false,
                    tooltipLocation: 'nw',
                    constrainZoomTo: 'x',
                    useTooltipFormatFunction: true,
                    tooltipFormatFunction: function (gridpos, datapos, plot) {
                        var col = czbrd.getColumnLocation(plot, gridpos.x, counts.length);
                        var s = '<div class="hl">Rok ' + facet[ col * 2 ] + ' (' + counts[col] + ')</div>';
                        return s;
                    },
                    showTooltipGridPosition: false,
                    showTooltipUnitPosition: false,
                    showTooltipDataPosition: true,
                    useAxesFormatters: false,
                    zoom: true
                },
                axesDefaults: {
                    tickRenderer: $.jqplot.CanvasAxisTickRenderer
                },
                axes: {
                    xaxis: {
                        renderer: $.jqplot.CategoryAxisRenderer,
                        ticks: values,
                        tickOptions: {
                            angle: 0,
                            formatString: '%d',
                            showGridline: false}
                    },
                    yaxis: {
                        //pad: 1.05,
                        padMin: 0,
                        tickOptions: {formatString: '%d'}
                    }
                }
            });
            $("#rokBars").bind('jqplotZoom', function (ev, gridpos, datapos, plot, cursor) {
                var column1 = czbrd.getColumnLocation(plot, cursor._zoom.start[0], counts.length);
                var column2 = czbrd.getColumnLocation(plot, cursor._zoom.end[0], counts.length);
                //console.log(column1, column2);
                var from = facet[ column1 * 2 ];
                var to = facet[ column2 * 2 ];
                if (column2 > column1) {
                    czbrd.addFilter("rokvydani", "[" + from + " TO " + to + "]");
                } else {
                    czbrd.addFilter("rokvydani", "[" + to + " TO " + from + "]");
                }
            }
            );
        }
    },
    doPHChart: function (facets) {
        var facet = facets.facet_ranges.mer_akt_KBLOKPH.counts;
        if (facet.length < 3) {

        } else {
            if ($("#phChart").length === 0) {
                var div = $('<div class="phChart box" style="height:130px; width:calc(100% - 4px);overflow:hidden;">' +
                        '<div id="phChart"class="chart" ></div>' +
                        '</div>');
                $("#facets").append("<div class=\"title\">pH. Aktuální stav</div>");

                $("#facets").append(div);
            } else {
                $("#phChart").html("");
            }

            var counts = [];
            var values = [];
            var colors = [];
            var ticks = [];
            for (var i = 0; i < facet.length; i = i + 2) {
                var ph = parseFloat(facet[i]) * 100;
                var phint = Math.round(ph) / 100;
                //values.push("" + ph + " - " + (ph + 1));
                values.push(phint);
                counts.push(parseInt(facet[i + 1]));
                colors.push(this.phColors[Math.floor(phint) - 1]);
                if (Math.round(phint) === phint) {
                    ticks.push("" + phint);
                } else {
                    ticks.push(" ");

                }
            }

            this.charts['phChart'] = $.jqplot("phChart", [counts], {
                //title: "PH. Aktuální stav",
                seriesDefaults: {
                    seriesColors: colors,
                    renderer: $.jqplot.BarRenderer,
                    //pointLabels: {show: true, location: 'n', edgeTolerance: 0},
                    rendererOptions: {
                        fillToZero: false,
                        barMargin: 0,
                        varyBarColor: true
                    }
                },
                cursor: {
                    followMouse: true,
                    show: true,
                    dblClickReset: false,
                    tooltipLocation: 'nw',
                    constrainZoomTo: 'x',
                    useTooltipFormatFunction: true,
                    tooltipFormatFunction: function (gridpos, datapos, plot) {
                        var col = czbrd.getColumnLocation(plot, gridpos.x, counts.length);
                        var s = '<div class="hl">pH ' + values[col] + ' (' + counts[col] + ')</div>';
                        return s;
                    },
                    showTooltipGridPosition: false,
                    showTooltipUnitPosition: false,
                    showTooltipDataPosition: true,
                    useAxesFormatters: false,
                    zoom: true
                },
                axesDefaults: {
                    tickRenderer: $.jqplot.CanvasAxisTickRenderer
                },
                axes: {
                    xaxis: {
                        renderer: $.jqplot.CategoryAxisRenderer,
                        ticks: ticks,
                        tickOptions: {showGridline: false}
                    },
                    yaxis: {
                        showticks: false,
                        ticks: [],
                        tickOptions: {
                            show: false
                        }
                    }
                }
            });


            $("#phChart").find('jqplot-yaxis').hide();


            $("#phChart").bind('jqplotZoom', function (ev, gridpos, datapos, plot, cursor) {
                var column1 = czbrd.getColumnLocation(plot, cursor._zoom.start[0], counts.length);
                var column2 = czbrd.getColumnLocation(plot, cursor._zoom.end[0], counts.length);

                var from = values[ column1 ];
                var to = values[ column2 ];
                if (column2 > column1) {
                    czbrd.addFilter("mer_akt_KBLOKPH", "[" + from + " TO " + to + "]");
                } else {
                    czbrd.addFilter("mer_akt_KBLOKPH", "[" + to + " TO " + from + "]");
                }
            }
            );
//    
//            $("#phChart").bind('jqplotClick',
//                    function (ev, gridpos, datapos, neighbor, plot) {
//                        var from = facet[  neighbor.pointIndex * 2 ];
//                        var to = facet[ ( neighbor.pointIndex + 1) * 2 ];
//                        czbrd.addFilter("mer_akt_KBLOKPH", "[" + from + " TO " + to + "}");
//                    }
//            );
        }
    },
    papirChart: function (facets) {
        var obj = "papirChart";
        var field = 'ex_FYZTYPPAPIRU_human';
        var facet = facets.facet_fields[field];
        var title = this.localize(field);
        this.pieChart(obj, field, title, facet);

    },
    tiskChart: function (facets) {
        var obj = "tiskChart";
        var field = 'ex_FYZTYPTISKU_human';
        var facet = facets.facet_fields[field];
        var title = this.localize(field);
        this.pieChart(obj, field, title, facet);

    },
    vazbaChart: function (facets) {
        var obj = "vazbaChart";
        var field = 'mer_POSVAZBA_human';
        var facet = facets.facet_fields[field];
        var title = this.localize(field);
        this.pieChart(obj, field, title, facet);

    },
    typChart: function (facets) {
        var obj = "typChart";
        var field = "ex_FYZTYPFONDU_human";
        var title = this.localize(field);
        var facet = facets.facet_fields[field];
        this.pieChart(obj, field, title, facet);
    },
    materialChart: function (facets) {
        var obj = "materialChart";
        var field = "ex_FYZMATERIAL_human";
        var title = this.localize(field);
        var facet = facets.facet_fields[field];
        this.pieChart(obj, field, title, facet);
    },
    pieChart: function (obj, field, title, facet) {
        $("#" + obj).html("");
        var vals = [];
        var s1 = [];
        for (var i = 0; i < facet.length; i = i + 2) {
            var count = parseInt(facet[i + 1]);
            var val = facet[i];
            if (val !== 'null') {
                s1.push([val + " (" + count + ")", count]);
                vals.push(val);
            }
        }

        this.charts[obj] = jQuery.jqplot(obj, [s1], {
            title: title,
            seriesDefaults: {
                // Make this a pie chart.
                renderer: jQuery.jqplot.PieRenderer,
                rendererOptions: {
                    showDataLabels: true
                }
            },
            legend: {show: true, location: 'e', placement: 'insideGrid'}
        });
        $("#" + obj).bind('jqplotDataHighlight', function (ev, seriesIndex, pointIndex, data) {
            var idx = pointIndex;
            $('#' + obj + ' tr.jqplot-table-legend').removeClass('legend-row-highlighted');
            $('#' + obj + ' tr.jqplot-table-legend').children('.jqplot-table-legend-label').removeClass('legend-text-highlighted');
            $('#' + obj + ' tr.jqplot-table-legend').eq(idx).addClass('legend-row-highlighted');
            $('#' + obj + ' tr.jqplot-table-legend').eq(idx).children('.jqplot-table-legend-label').addClass('legend-text-highlighted');
        });

        $("#" + obj).bind('jqplotDataUnhighlight', function (ev, seriesIndex, pointIndex, data) {
            $('tr.jqplot-table-legend').removeClass('legend-row-highlighted');
            $('tr.jqplot-table-legend').children('.jqplot-table-legend-label').removeClass('legend-text-highlighted');
        });

        $("#" + obj).bind('jqplotClick',
                function (ev, gridpos, datapos, neighbor, plot) {
                    //console.log(plot);

                    if (neighbor !== null) {
                        var column = neighbor.pointIndex;
                        var val = vals[column];
                        czbrd.addFilter(field, '"'+val+'"');
                    }
                }
        );

        $('#' + obj + " table.jqplot-table-legend").css("z-index", 4);
        $('#' + obj + " td.jqplot-table-legend").addClass("link");
        $('#' + obj + " tr.jqplot-table-legend").click(function () {
            var idx = $(this).index();
            var typ = vals[idx];
            czbrd.addFilter(field, '"'+typ+'"');
        });

    },
    phActual: function () {
        if(!this.isHome){
            return;
        }
        //$("#phBars").html("");
        var counts = [];
        var colors = [];
        var values = [];
        var ticks = [];
        var facet = this.resp.facet_counts.facet_ranges.mer_akt_KBLOKPH.counts;
        for (var i = 0; i < facet.length; i = i + 2) {

            var ph = parseFloat(facet[i]) * 100;
            var phint = Math.round(ph) / 100;
            //values.push("" + ph + " - " + (ph + 1));
            values.push(phint);
            counts.push(parseInt(facet[i + 1]));
            colors.push(this.phColors[Math.floor(phint) - 1]);
            if (Math.round(phint) === phint) {
                ticks.push("" + phint);
            } else {
                ticks.push(" ");

            }

        }
        var counts2 = [];
        var facet2 = this.resp.facet_counts.facet_ranges.mer_puv_KBLOKPH.counts;
        for (var i = 0; i < facet2.length; i = i + 2) {
            counts2.push(parseInt(facet2[i + 1]));
        }

        this.charts['phPuvAkt'] = $.jqplot("phBars", [counts], {
            title: czbrd.localize('mer_akt_KBLOKPH'),
            seriesDefaults: {
                renderer: $.jqplot.BarRenderer,
                seriesColors: colors,
                rendererOptions: {
                    fillToZero: false,
                    varyBarColor: true,
                    barMargin: 0
                }
            },
            cursor: {
                followMouse: true,
                show: true,
                dblClickReset: false,
                tooltipLocation: 'nw',
                constrainZoomTo: 'x',
                useTooltipFormatFunction: true,
                tooltipFormatFunction: function (gridpos, datapos, plot) {
                    var col = czbrd.getColumnLocation(plot, gridpos.x, counts.length);
                    var s = '<div class="hl">pH ' + values[col] + ' (' + counts[col] + ')</div>';
                    return s;
                },
                showTooltipGridPosition: false,
                showTooltipUnitPosition: false,
                showTooltipDataPosition: true,
                useAxesFormatters: false,
                zoom: true
            },
            highlighter: {
                show: false,
                showMarker: false,
                tooltipLocation: 'ne',
                tooltipContentEditor: function (str, neighbor_seriesIndex, neighbor_pointIndex, plot) {
                    var ph1 = values[neighbor_pointIndex];
                    var s = '<div class="hl">pH: ' + ph1 + '</div>';
//                        var ph2 = values[neighbor_pointIndex + 2];
//                        var s = '<div class="hl">PH: od ' + ph1 + ' do ' + ph2 + '</div>';
                    return s;
                },
                sizeAdjust: 7.5

            },
            axesDefaults: {
                tickRenderer: $.jqplot.CanvasAxisTickRenderer
            },
            axes: {
                xaxis: {
                    renderer: $.jqplot.CategoryAxisRenderer,
                    ticks: ticks,
                    tickOptions: {showGridline: false}
                },
                yaxis: {
//                    renderer: $.jqplot.LogAxisRenderer,
                    padMin: 0,
                    tickOptions: {formatString: '%d'}
                }
            },
            series: [
                //{label: 'původní stav'},
                {label: 'aktuální stav'}
            ],
            legend: {show: false, location: 'e'}
        });
        $("#phBars").bind('jqplotZoom', function (ev, gridpos, datapos, plot, cursor) {
            var column1 = czbrd.getColumnLocation(plot, cursor._zoom.start[0], counts.length);
            var column2 = czbrd.getColumnLocation(plot, cursor._zoom.end[0], counts.length);

            var from = values[ column1 ];
            var to = values[ column2 ];
            if (column2 > column1) {
                czbrd.addFilter("mer_akt_KBLOKPH", "[" + from + " TO " + to + "]");
            } else {
                czbrd.addFilter("mer_akt_KBLOKPH", "[" + to + " TO " + from + "]");
            }
        }
        );

//        $("#phBars").bind('jqplotClick',
//                function (ev, gridpos, datapos, neighbor, plot) {
//                    var serie = neighbor.seriesIndex;
//                    var column = neighbor.pointIndex;
//                    var ph = parseInt(facet[ column * 2 ]);
//                    var val = "[" + ph + " TO " + (ph+1) + "}";
//                    if(serie === 0){
//                        czbrd.addFilter("mer_puv_KBLOKPH", val);
//                    }else{
//                        czbrd.addFilter("mer_akt_KBLOKPH", val);
//                    }
//                    
//                }
//        );
    },
    dzChart: function () {
        var obj = "druhZasahuChart";
        var title = "Druh zásahu";
        var field = 'mer_akt_DRUHZASAHU_human';
        $("#" + obj).html("");
        var facet = this.resp.facet_counts.facet_fields[field];

        var counts = [];
        var values = [];
        var leg = [];
        for (var i = 0; i < facet.length; i = i + 2) {
            values.push(facet[i]);
            var c = parseInt(facet[i + 1]);
            counts.push([c]);
            leg.push({label: facet[i] + ' (' + (c) + ')'});
        }

        this.charts[obj] = $.jqplot(obj, counts, {
            title: title,
            seriesDefaults: {
                renderer: $.jqplot.BarRenderer,
                rendererOptions: {fillToZero: false}
            },
            cursor: {
                style: 'pointer',
                followMouse: true,
                show: true,
                dblClickReset: false,
                tooltipLocation: 'nw',
                useTooltipFormatFunction: true,
                tooltipFormatFunction: function (gridpos, datapos, plot) {
                    var col = czbrd.getColumnLocation(plot, gridpos.x, counts.length);
                    var s = '<div class="hl">' + values[ col ] + ' (' + counts[col] + ')</div>';
                    return s;
                },
                showTooltipGridPosition: false,
                showTooltipUnitPosition: false,
                showTooltipDataPosition: true,
                useAxesFormatters: false
            },
            highlighter: {
                show: false,
                sizeAdjust: 5.5,
                tooltipLocation: 'nw',
                tooltipContentEditor: function (str, neighbor_seriesIndex, neighbor_pointIndex, plot) {
                    var s = '<div class="hl"> ' + values[neighbor_pointIndex] + ' (' + counts[neighbor_pointIndex] + ')</div>';
                    return s;
                },
                showMarker: false
            },
            axesDefaults: {
                tickRenderer: $.jqplot.CanvasAxisTickRenderer
            },
            axes: {
                xaxis: {
                    renderer: $.jqplot.CategoryAxisRenderer,
                    //ticks: values,
                    tickOptions: {show: false, angle: 0, showGridline: false}
                },
                yaxis: {
                    renderer: $.jqplot.LogAxisRenderer,
                    //pad: 1.05,
                    //tickOptions: {formatString: '%d'},
                    padMin: 0
                }
            },
            series: leg,
            legend: {show: true, location: 'ne'}
        });
        $("#" + obj).bind('jqplotClick',
                function (ev, gridpos, datapos, neighbor, plot) {
                    var col = czbrd.getColumnLocation(plot, gridpos.x, counts.length);
                    var dz = values[col];
                    czbrd.addFilter(field, '"' + dz + '"');
                }
        );

    }

};

