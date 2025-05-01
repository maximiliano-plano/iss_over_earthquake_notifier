
** Requirements
* The Earthquake Catalog API provides detailed information about all registered earthquakes world wide. See https://earthquake.usgs.gov/fdsnws/event/1/
* The WhereIsTheISS API provides the current location of the ISS Space station. See https://wheretheiss.at/w/developer
* Design a system which main purpose is to provide realtime warnings whenever the ISS is flying over an area which has been hit by an earthquake. Ensure the area can be specified as a maximum distance from the middle point of the earthquake. Also ensure the minimum magnitude of an earthquake can be specified. As well as the minimum age of the earthquake. Given these parameters, clients should be able to subscribe to the warning system and get notified by for example a web hook or through a web socket.
* Build a proof of concept to showcase how such a system could work. Ensure the POC can run on any machine without any prerequisites. Don't try to build the complete system, focus on the parts which are most significant.

** Assumtions 
* Age, minimum magnitud and minimum age
* Since we are trying to provide realtime warnings age of the earthquake is express in 'hours'. Considering that earthquakes older than, for example an hour, are not relevant in our search.

* Get Earthquakes, 
Let's suppouse our implementation requires that every client that connects to our service wants to determine the age, magnitud and distance of the earthquakes it wants to be notify, to do so we should consider every earthquake in history and  