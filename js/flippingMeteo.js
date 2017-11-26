(function( $ ) {

    var _init = function(obj) {
        return obj.each(function(){

            var lat,
                lng,
                address,
                position,
                degrees,
                icon,
                condition,
                day,
                humidity,
                wind;

            /**
             * Tests geolocation support
             */
            function testGeolocation() {
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        lat = position.coords.latitude;
                        lng = position.coords.longitude;

                        initMap();
                    });
                } else {
                    console.log('Geolocation not available');
                }
            }


            /**
             * Initializes Google Map
             */
            function initMap() {
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 8,
                    center: {lat: lat, lng: lng}
                });
                var geocoder = new google.maps.Geocoder;
                var infowindow = new google.maps.InfoWindow;

                geocodeLatLng(geocoder, map, infowindow);
            }


            /**
             * Creates Google Map
             */
            function geocodeLatLng(geocoder, map, infowindow) {
                var latlng = {lat: lat, lng: lng};
                geocoder.geocode({'location': latlng}, function(results, status) {
                    if (status === 'OK') {
                        if (results[4]) {
                            address = results[0].formatted_address;
                            var pos = results[4].formatted_address;
                            position = pos.substring(0, pos.indexOf(','));
                            map.setZoom(11);
                            var marker = new google.maps.Marker({
                                position: latlng,
                                map: map
                            });                            
                            infowindow.setContent(results[0].formatted_address);
                            infowindow.open(map, marker);

                            getWeatherInfo();
                        } else {
                            window.alert('No results found');
                        }
                    } else {
                        window.alert('Geocoder failed due to: ' + status);
                    }
                });
            }

            /**
             * Renders the front of the card
             */
            function renderFront() {
                $('.front .position').html(position);
                $('.front .degrees').html(degrees);
                $('.front .humidity').html(humidity);
                $('.front .wind').html(wind);
                $('.front .icon').addClass('code'+icon);
                $('.front .condition').html(condition);

                $('div.days ul li').filter(function(){
                    return $(this).attr('data-day') === day;
                }).addClass('active');
            }

            /**
             * Renders the back of the card
             */
            function renderBack() {
                $('.back p').html(address);
            }

            /**
             * Removes preloader icon
             */
            function removePreloader() {
                $('.preloader').fadeOut(200, function() {
                    $(this).remove();
                    $('.container').addClass('active');
                })
            }

            /**
             * Disables turning behavior when user clicks on the map
             */
            function mapSafeClick() {
                $('#map').click(function(e){
                    e.stopPropagation();
                });
            }

            /**
             * Adds click support on touch devices
             */
            function addClickSupport() {
                if($('html').hasClass('touchevents')) {
                    $('.container').click(function(e){
                        $('.card').toggleClass('flipped');
                    });
                    mapSafeClick();
                }
            }

            /**
             * Gets weather info
             */
            function getWeatherInfo() {                
                var queryCondition = "select item.condition from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + position + "') and u='c'";
                var queryWindAtmosphere = "select wind, atmosphere from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + position + "') and u='f'";
                $.getJSON("https://query.yahooapis.com/v1/public/yql?q=" + queryCondition + "&format=json", function(data){
                    degrees = data.query.results.channel.item.condition.temp + '&#176';
                    icon = data.query.results.channel.item.condition.code;
                    condition = data.query.results.channel.item.condition.text;
                    var date = data.query.results.channel.item.condition.date;
                    day = date.substring(0, date.indexOf(','));

                    $.getJSON("https://query.yahooapis.com/v1/public/yql?q=" + queryWindAtmosphere + "&format=json", function(data){
                        humidity = data.query.results.channel.atmosphere.humidity + '%';
                        wind = 'F at ' + data.query.results.channel.wind.speed + ' mph';
                        renderFront();
                        renderBack();
                        removePreloader();
                        addClickSupport();                        
                    });
                });                

            }


            testGeolocation();
        });
    };

    $.fn.flippingMeteo = function() {
        return _init(this);
    };

}( jQuery ));
