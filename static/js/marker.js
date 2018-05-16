var INACCURATE_MARKER_OPACITY = 0.5;

var templates = {
    united: $("#united-marker-content-template").html(),
    rsa: $("#rsa-marker-content-template").html(),
    default: $("#marker-content-template").html()
};

var MarkerView = Backbone.View.extend({
    events : {
        "click .delete-button" : "clickDelete",
        "click .accordion-container input" : "accordionInputClick"
    },
    initialize : function(options) {
        this.map = options.map;
        this.markerIconType = options.markerIconType;
        _.bindAll(this, "clickMarker");
    },
    localize : function(field,value,el) {
        //localizes non-mandatory data (which has the same consistent html and python field names)
        if (this.model.has(value) && this.model.get(value)!="" &&
            localization[field][this.model.get(value)]!=undefined) {
            el.find("." + value).text(fields[field] + ": " + localization[field][this.model.get(value)]);
        }
    },
    render : function() {
        var markerPosition = new google.maps.LatLng(this.model.get("latitude"),
        this.model.get("longitude"));

        this.marker = new google.maps.Marker({
            position: markerPosition,
            id: this.model.get("id"),
            class: 'marker'
        });

        if (app.map.zoom < MINIMAL_ZOOM) {
            return this;
        }

        this.marker.setIcon(this.getIcon());
        if (!app.heatMapMode){
            this.marker.setMap(this.map);
        }
        this.marker.view = this;

        if (this.model.get("type") == MARKER_TYPE_DISCUSSION) {
            this.marker.setTitle(this.getTitle('discussion')); //this.model.get("title"));
            google.maps.event.addListener(this.marker, "click",
                _.bind(app.showDiscussion, app, this.model.get("identifier")) );
            return this;
        }

        this.marker.setTitle(this.getTitle('single'));

        app.oms.addMarker(this.marker);

        return this;
    },
    populateMarkerInfo : function() {
        var provider = PROVIDERS[this.model.get("provider_code")];
        if (this.model.get("provider_code") == UNITED_HATZALA_CODE) {
            var temp = $("<div/>");
            temp.html(templates.rsa);

            temp.find(".title").text(this.marker.get("title"));
            temp.find(".content").text("תיאור אירוע: " + this.marker.get("title"));
            temp.find(".creation-date").text("תאריך: " + moment(this.model.get("created")).format("LLLL"));
            temp.find(".address").text("מיקום: " + this.model.get("address"));
            this.localize("MEZEG_AVIR_UNITED","weather",temp);
            if (this.model.get("description") != "") {
                temp.find(".comments").text("הערות: " + this.model.get("description"));
            }
            temp.find(".profile-image").attr("width", "70px");
            temp.find(".profile-image").attr("src", "/static/img/logos/" + provider.logo);
            temp.find(".profile-image").attr("title", provider.name);
            temp.find(".profile-image-url").attr("href", provider.url);
            temp.find(".added-by").html("מקור: <a href='" +
                                            provider.url + "' target='blank'>" + provider.name + "</a>");

            this.$el.html(temp.html());
        } else if (this.model.get("provider_code") == RSA_PROVIDER_CODE) {
            var temp = $("<div/>");
            temp.html(templates.rsa);

            temp.find(".title").text(this.marker.get("title"));
            temp.find(".description").text(this.model.get("description"));
            temp.find(".profile-image").attr("width", "70px");
            temp.find(".profile-image").attr("src", "/static/img/logos/" + provider.logo);
            temp.find(".profile-image").attr("title", provider.name);
            temp.find(".profile-image-url").attr("href", provider.url);
            temp.find(".added-by").html("מקור: <a href='" +
                                            provider.url + "' target='blank'>" + provider.name + "</a>");

            this.$el.html(temp.html());

        } else {
            var temp = $("<div/>");
            temp.html(templates.default);
            
            temp.find(".title").text(this.marker.get("title"));
            temp.find(".id").text(fields.ACC_ID + ": " + this.marker.get("id"));
            temp.find(".provider_code").text(fields.PROVIDER_CODE + ": " + this.model.get("provider_code"));
            temp.find(".roadType").text(fields.SUG_DEREH + ": " + localization.SUG_DEREH[this.model.get("roadType")]);
            temp.find(".accidentType").text(fields.SUG_TEUNA+ ": " + localization.SUG_TEUNA[this.model.get("subtype")]);
            temp.find(".roadShape").text(fields.ZURAT_DEREH+ ": " + localization.ZURAT_DEREH[this.model.get("roadShape")]);
            temp.find(".severityText").text(fields.HUMRAT_TEUNA + ": " + localization.HUMRAT_TEUNA[this.model.get("severity")]);
            temp.find(".dayType").text(fields.SUG_YOM + ": " + localization.SUG_YOM[this.model.get("dayType")]);
            temp.find(".igun").text(fields.STATUS_IGUN + ": " + localization.STATUS_IGUN[this.model.get("locationAccuracy")]);
            temp.find(".unit").text(fields.YEHIDA + ": " + localization.YEHIDA[this.model.get("unit")]);
            temp.find(".mainStreet").text(this.model.get("mainStreet"));
            temp.find(".secondaryStreet").text(this.model.get("secondaryStreet"));
            temp.find(".junction").text(this.model.get("junction"));

            // Non-mandatory fields:
            this.localize("HAD_MASLUL","one_lane",temp);
            this.localize("RAV_MASLUL","multi_lane",temp);
            this.localize("MEHIRUT_MUTERET","speed_limit",temp);
            this.localize("TKINUT","intactness",temp);
            this.localize("ROHAV","road_width",temp);
            this.localize("SIMUN_TIMRUR","road_sign",temp);
            this.localize("TEURA","road_light",temp);
            this.localize("BAKARA","road_control",temp);
            this.localize("MEZEG_AVIR","weather",temp);
            this.localize("PNE_KVISH","road_surface",temp);
            this.localize("SUG_EZEM","road_object",temp);
            this.localize("MERHAK_EZEM","object_distance",temp);
            this.localize("LO_HAZA","didnt_cross",temp);
            this.localize("OFEN_HAZIYA","cross_mode",temp);
            this.localize("MEKOM_HAZIYA","cross_location",temp);
            this.localize("KIVUN_HAZIYA","cross_direction",temp);

            temp.find(".creation-date").text("תאריך: " +
                moment(this.model.get("created")).format("LLLL"));
            temp.find(".profile-image").attr("width", "50px");
            temp.find(".profile-image").attr("src", "/static/img/logos/" + provider.logo);
            temp.find(".profile-image").attr("title", provider.name);
            temp.find(".profile-image-url").attr("href", provider.url);
            temp.find(".added-by").html("מקור: <a href='" +
                provider.url + "' target='blank'>" + provider.name + "</a>");

            this.$el.html(temp.html());
        }
    },
    getIcon : function() {
        return {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 0,
            fillColor: 'black'
        };
    },
    getTitle : function(markerType) {
        var markerTitle = '';
        var accuracy = '';
        var markerIconTypeIdentifier = this.markerIconType ? '' : '.';
        switch (markerType){
            case 'single':
                var loc = '';
                if (this.model.get("junction") !== null) {
                    loc = this.model.get("junction");
                } else {
                    if (this.model.get("secondaryStreet") !== null) {
                        loc = "ברחוב " + this.model.get("secondaryStreet") + " פינת " + this.model.get("mainStreet");
                    }
                    else {
                        if (this.model.get("mainStreet") !== null) {
                            loc = "ברחוב " + this.model.get("mainStreet");
                        }
                    }
                }

            accuracy = !(this.model.get("locationAccuracy") == 1);

            if (this.model.get("provider_code") == 4) {
                markerTitle = "אירוע שדווח על ידי שומרי הדרך";
            } else {
                markerTitle = "ביום " + moment(this.model.get("created")).format("dddd") + ", ה-"
                    + moment(this.model.get("created")).format("LL")
                    + " אירעה תאונה " + SEVERITY_MAP[this.model.get("severity")]
                    + " מסוג " + localization.SUG_TEUNA[this.model.get("subtype")] + " "
                    + loc;
            }
                break;
            case 'multiple':
                accuracy = (this.marker.opacity != 1);
                markerTitle = 'תאונות ו/או אירועים בנקודה זו'; // the number of the accidents will be chain to the start of the title.
                break;
            case 'discussion':
                markerTitle = 'דיון';
                break;
            default:
                break;
        }

        if (markerType == 'discussion')
            return markerTitle + markerIconTypeIdentifier;
        else{
            accuracy = accuracy ?  ' (מיקום משוער)' : '';
            return markerTitle + accuracy +  markerIconTypeIdentifier;
        }
    },
    choose : function() {
        if (this.model.get("groupID") && !this.model.get("currentlySpiderfied")) {
            new google.maps.event.trigger(this.marker, "click");
        }
        new google.maps.event.trigger(this.marker, "click");
    },
    getUrl: function () {
        return "/?marker=" + this.model.get("id") + "&" + app.getCurrentUrlParams();
    },
    localize_data: function(data,field,value,dataType,involved_or_vehicles) {
        switch (dataType) {
            case "invs":
                if (inv_dict[field] != undefined && inv_dict[field][data[i][value]] != undefined) {
                    text_line = "<p style=margin:0>" + fields[field] + ": " + inv_dict[field][data[i][value]] + "</p>";
                    that.$el.find("#" + involved_or_vehicles).append(text_line);
                }
                break;

            case "vehs":
                if (veh_dict[field] != undefined && veh_dict[field][data[i][value]] != undefined) {
                    text_line = "<p style=margin:0>" + fields[field] + ": " + veh_dict[field][data[i][value]] + "</p>";
                    that.$el.find("#" + involved_or_vehicles).append(text_line);
                }
                break;

            case "nums":
                if (value == "seats" && data[i]["seats"] == 99) { break; }
                if ([data[i][value]] != undefined && [data[i][value]] != 0 && [data[i][value]] != -1) {
                    text_line = "<p style=margin:0>" + fields[field] + ": " + data[i][value] + "</p>";
                    that.$el.find("#" + involved_or_vehicles).append(text_line);
                }
                break;
        }
    },
    clickMarker : function() {
        that = this;
        app.closeInfoWindow();
        app.selectedMarker = this;
        var infoWindowOffset = this.markerIconType ? new google.maps.Size(0,-25) : new google.maps.Size(0,0);

        this.populateMarkerInfo();

        if (this.marker_clicked) {
            app.infoWindow = new google.maps.InfoWindow({
                content: that.el,
                pixelOffset: infoWindowOffset
            });
            app.infoWindow.open(that.map, that.marker);
            app.updateUrl(that.getUrl());
        } else {
            this.marker_clicked = true;
            $.get("/markers/" + this.model.get("id"), function (data) {
                data = JSON.parse(data);

                var j = 1;
                for (i in data) {
                    if (data[i]["sex"] != undefined) {
                        text_line = "<p style=margin:0><strong>פרטי אדם מעורב" + " " + (i*1+1) + "</strong></p>";
                        that.$el.find("#involved").append(text_line);
                        that.localize_data(data,"SUG_MEORAV","involved_type","invs","involved");
                        that.localize_data(data,"SHNAT_HOZAA","license_acquiring_date","nums","involved");
                        that.localize_data(data,"KVUZA_GIL","age_group","nums","involved");
                        that.localize_data(data,"MIN","sex","invs","involved");
                        that.localize_data(data,"MAHOZ_MEGURIM","home_district","nums","involved");
                        that.localize_data(data,"SUG_REHEV_NASA_LMS","car_type","invs","involved");
                        that.localize_data(data,"EMZAE_BETIHUT","safety_measures","invs","involved");
                        that.localize_data(data,"HUMRAT_PGIA","injury_severity","invs","involved");
                        that.localize_data(data,"SUG_NIFGA_LMS","injured_type","invs","involved");
                        that.localize_data(data,"PEULAT_NIFGA_LMS","injured_position","invs","involved");
                        that.localize_data(data,"KVUTZAT_OHLUSIYA_LMS","population_type","nums","involved");
                        that.$el.find("#involved").append("<p></p>");
                    }else{
                        text_line = "<p style=margin:0><strong>פרטי רכב מעורב" + " " + (j) + "</strong></p>";
                        that.$el.find("#vehicles").append(text_line);
                        that.localize_data(data,"SUG_REHEV_LMS","vehicle_type","vehs","vehicles");
                        that.localize_data(data,"NEFAH","engine_volume","nums","vehicles");
                        that.localize_data(data,"SHNAT_YITZUR","manufacturing_year","nums","vehicles");
                        that.localize_data(data,"KIVUNE_NESIA","driving_directions","nums","vehicles");
                        that.localize_data(data,"MATZAV_REHEV","vehicle_status","vehs","vehicles");
                        that.localize_data(data,"SHIYUH_REHEV_LMS","vehicle_attribution","vehs","vehicles");
                        that.localize_data(data,"MEKOMOT_YESHIVA_LMS","seats","nums","vehicles");
                        that.localize_data(data,"MISHKAL_KOLEL_LMS","total_weight","nums","vehicles");
                        that.$el.find("#vehicles").append("<p></p>");
                        j++;
                    }
                }
                app.infoWindow = new google.maps.InfoWindow({
                    content: that.el,
                    pixelOffset: infoWindowOffset
                });
                app.infoWindow.open(that.map, that.marker);
                app.updateUrl(that.getUrl());
            });
        }

        app.map.gestureHandling = "cooperative";
        $(document).keydown(app.ESCinfoWindow);
    },
    clickShare : function() {
        FB.ui({
            method: "feed",
            name: this.model.get("title"),
            link: document.location.href,
            description: this.model.get("description"),
            caption: SUBTYPE_STRING[this.model.get("subtype")]
            // picture
        });
    },
    accordionInputClick : function(e) {
        var input = e.currentTarget;
        if (input.checked){
            var infoWindow = $(input).parents(".gm-style-iw > div");
            var labelTop = $(input).siblings("label").offset().top;
            var infoWindowPos = infoWindow.offset().top;
            var IwHalfHeight = infoWindow.height() / 2;
            var labelPosRelativeToIw = labelTop - infoWindowPos;
            if (labelPosRelativeToIw > IwHalfHeight) {
                var curIwScroll = infoWindow.scrollTop();
                var labelPos = labelTop - infoWindowPos + curIwScroll;

                setTimeout(function(){
                    var sectionHeightScroll = $(input).siblings(".accordion-roller").height() + curIwScroll;
                    var bestScrollTo = Math.min(sectionHeightScroll, labelPos);
                    var scrollAnimationDuration = Math.min((bestScrollTo - curIwScroll) * 9, 1300);

                    $(infoWindow).on("mousewheel keyup mousedown DOMMouseScroll wheel touchmove", function(){
                        $(infoWindow).stop();
                    });

                    $(infoWindow).animate({
                        scrollTop: bestScrollTo
                    }, scrollAnimationDuration, function(){
                        $(infoWindow).off("mousewheel keyup mousedown DOMMouseScroll wheel touchmove");
                    });
                }.bind(this),550);
            }
        }
    },
    select : function(){
        //unselect all previous selections
        _.each(app.markerList, function(markerView){
            markerView.unselect();
        });
        //if marker is currently shown
        this.marker.setTitle(this.marker.getTitle() + SELECTED_MARKER);
    },
    unselect : function(){
        //if was selected and currently displayed as single icon
        if(this.isSelected()){
            this.marker.setTitle(this.marker.getTitle().replace(SELECTED_MARKER, ""));
        }
    },
    isSelected : function(){
        //if shown and selected
        return this.marker.getTitle().search(SELECTED_MARKER) != -1;
    },
});
