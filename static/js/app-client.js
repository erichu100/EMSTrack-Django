import { TopicObserver } from "./topic-observer";

export class AppClient extends TopicObserver {
    
    ambulances;
    hospitals;
    bases;
    calls;

    /**
     *
     * @param {MqttClient} mqttClient
     * @param httpClient
     */
    constructor(mqttClient, httpClient) {

        // call super
        super();

        // mqtt client
        this.mqttClient = mqttClient;
        this.event_observer = null;

        // register observer
        this.event_observer = (event) => this.eventHandler(event);
        this.mqttClient.observe(this.event_observer);

        // http client
        this.httpClient = httpClient;

    }

    disconnect() {

        // return if not connected
        if (!this.mqttClient.isConnected)
            return;

        // remove observer
        this.mqttClient.remove(this.observer);
        this.event_observer = null;

        // connect to client
        this.mqttClient.disconnect();

    }

    /**
     *
     * @param {MqttEvent} event
     */
    eventHandler(event) {

        if (event.event === 'messageReceived') {

            const topic = event.object.destinationName;
            const payload = JSON.parse(event.object.payloadString);

            // broadcast
            this.observers.broadcast(topic, {topic: topic, payload: payload});

        }

    }

    subscribe(filter, fn, options) {
        options = options || {};
        this.mqttClient.subscribe(filter, options);
        this.observers.observe(filter, fn)
    }

    unsubscribe(filter, fn, options) {
        options = options || {};
        this.mqttClient.unsubscribe(filter, options);
        this.observers.remove(filter, fn)
    }

    publish(topic, payload, qos, retained) {
        this.mqttClient.publish(topic, payload, qos, retained);
    }

    updateAmbulance(message) {
        const ambulance = message.payload;
        this.ambulances[ambulance.id] = ambulance;
    }

    updateHospital(message) {
        const hospital = message.payload;
        this.hospitals[hospital.id] = hospital;
    }

    updateCall(message) {
        const call = message.payload;
        this.call[call.id] = call;
    }

    updateAmbulanceCallStatus(message) {

        const status = message.payload;

        // get ambulance and call ids
        const topic = message.topic.split('/');
        const ambulance_id = topic[1];
        const call_id = topic[3];

        if ( !this.calls.hasOwnProperty(call_id) && status !== 'C' ) {

            // retrieve call from api
            this.httpClient.get('call/' + call_id + '/')
                .then( (call) => {

                    // update call
                    this.calls[call.id] = call;

                    // subscribe
                    AppClient.this.subscribe('call/' + call.id + '/data', this.updateCall);

            });

        }

    }

    retrieveAmbulances() {

        // initialized if needed
        if (this.ambulances === null)
            this.ambulances = {};

        // retrieve ambulances
        this.httpClient.get('ambulance/')
            .then( (response) => {
                
                // Update ambulances
                response.data.forEach( (ambulance) => {
                    
                    // update ambulance
                    this.ambulances[ambulance.id] = ambulance;
                    
                    // subscribe
                    // TODO: check if already subscribed
                    AppClient.this.subscribe('ambulance/' + ambulance.id + '/data',
                        this.updateAmbulance);
                    AppClient.this.subscribe('ambulance/' + ambulance.id + '/call/+/status',
                        this.updateAmbulanceCallStatus);
                    
                });
                
            })
            .catch( (error) => {
                console.log('retrieveAmbulance: ' + error);
            });

    }
    
    retrieveHospitals() {
        
        // initialized if needed
        if (this.hospitals === null)
            this.hospitals = {};

        // retrieve ambulances
        this.httpClient.get('hospital/')
            .then( (response) => {
                
                // Update hospitals
                response.data.forEach( (hospital) => {
                    
                    // update hospital
                    this.hospitals[hospital.id] = hospital;
                    
                    // subscribe
                    // TODO: check if already subscribed
                    AppClient.this.subscribe('hospital/' + hospital.id + '/data', this.updateHospital);
                    
                });
                
            })
            .catch( (error) => {
                console.log('retrieveHospital: ' + error);
            });

    }

    retrieveCalls() {
        
        // initialized if needed
        if (this.calls === null)
            this.calls = {};

        // retrieve ambulances
        this.httpClient.get('call/')
            .then( (response) => {
                
                // Update calls
                response.data.forEach( (call) => {
                    
                    // update call
                    this.calls[call.id] = call;
                    
                    // subscribe
                    // TODO: check if already subscribed
                    AppClient.this.subscribe('call/' + call.id + '/data', this.updateCall);
                    
                });
                
            })
            .catch( (error) => {
                console.log('retrievecall: ' + error);
            });

    }

    retrieveBases() {

        // initialized if needed
        if (this.bases === null)
            this.bases = {};

        // retrieve ambulances
        this.httpClient.get('location/Base/')
            .then( (response) => {

                // Update bases
                response.data.forEach( (base) => {

                    // update base
                    this.bases[base.id] = base;

                });

            })
            .catch( (error) => {
                console.log('retrieveBase: ' + error);
            });

    }

}
