////////////////////////////////////////
// reload page after Forward and back
///////////////////////////////////////

const TYPE_BACK_FORWARD = 2;

function isReloadedPage() {
  return performance.navigation.type === TYPE_BACK_FORWARD;
}

function main() {
  if (isReloadedPage()) {
    window.location.reload();
  }
}
main();

////////////////////////////////////////////////////////////
///// TEAM  API REQUEST ` `
////////////////////////////////////////////////////////////


Vue.use(VueMeta);

new Vue({
    
  el: '#editable',

  data () {
  
    return {
      mentorData: [],
      participantData: [],
      pressData: [],
      featuredPressData: [],
      faqData:[],
      showMessage: true,
      index_active:0,
      alertData: [],
    }
  },

  created: function created() {
    this.fetchAlerts();
    this.fetchMentor();
    this.fetchPress();
    this.fetchFeaturedPress();
    this.toggleMessage();
    this.fetchQuestions();
    this.fetchParticipants();
  },


  methods: {
    fetchFeaturedPress() {
      self = this;
      // Load from local data only (offline mode)
      if (window.DATA_PATH) {
        fetch(window.DATA_PATH + 'featured-press-local.json')
          .then(response => response.json())
          .then(data => {
            self.featuredPressData = data.data;
            console.log('Loaded featured press from local JSON file (offline mode)');
          })
          .catch(error => {
            console.error('ERROR: Local featured press data not available. This site requires offline data to function.');
            console.error('Please ensure featured-press-local.json exists in the data directory.');
          });
      } else {
        console.error('ERROR: DATA_PATH not set. This site requires offline data to function.');
      }
    },
    fetchPress() {
      self = this;
      // Load from local data only (offline mode)
      if (window.DATA_PATH) {
        fetch(window.DATA_PATH + 'press-local.json')
          .then(response => response.json())
          .then(data => {
            self.pressData = data.data;
            console.log('Loaded press from local JSON file (offline mode)');
          })
          .catch(error => {
            console.error('ERROR: Local press data not available. This site requires offline data to function.');
            console.error('Please ensure press-local.json exists in the data directory.');
          });
      } else {
        console.error('ERROR: DATA_PATH not set. This site requires offline data to function.');
      }
    },
    fetchAlerts() {
      self = this;
      // Load from local data only (offline mode)
      if (window.DATA_PATH) {
        fetch(window.DATA_PATH + 'alerts-local.json')
          .then(response => response.json())
          .then(data => {
            self.alertData = data.data;
            console.log('Loaded alerts from local JSON file (offline mode)');
          })
          .catch(error => {
            console.error('ERROR: Local alerts data not available. This site requires offline data to function.');
            console.error('Please ensure alerts-local.json exists in the data directory.');
          });
      } else {
        console.error('ERROR: DATA_PATH not set. This site requires offline data to function.');
      }
    },
    fetchMentor() {
      self = this;
      // Load from local data only (offline mode)
      if (window.DATA_PATH) {
        fetch(window.DATA_PATH + 'mentors-local.json')
          .then(response => response.json())
          .then(data => {
            self.mentorData = data.data;
            console.log('Loaded mentors from local JSON file (offline mode)');
          })
          .catch(error => {
            console.error('ERROR: Local mentors data not available. This site requires offline data to function.');
            console.error('Please ensure mentors-local.json exists in the data directory.');
          });
      } else {
        console.error('ERROR: DATA_PATH not set. This site requires offline data to function.');
      }
    },
    fetchParticipants() {
      self = this;
      // Load from local data only (offline mode)
      if (window.DATA_PATH) {
        fetch(window.DATA_PATH + 'participants-local.json')
          .then(response => response.json())
          .then(data => {
            self.participantData = data.data;
            console.log('Loaded participants from local JSON file (offline mode)');
          })
          .catch(error => {
            console.error('ERROR: Local participants data not available. This site requires offline data to function.');
            console.error('Please ensure participants-local.json exists in the data directory.');
          });
      } else {
        console.error('ERROR: DATA_PATH not set. This site requires offline data to function.');
      }
    },
    fetchQuestions() {
      self = this;
      // Load from local data only (offline mode)
      if (window.DATA_PATH) {
        fetch(window.DATA_PATH + 'faq-local.json')
          .then(response => response.json())
          .then(data => {
            self.faqData = data.data;
            console.log('Loaded FAQ from local JSON file (offline mode)');
          })
          .catch(error => {
            console.error('ERROR: Local FAQ data not available. This site requires offline data to function.');
            console.error('Please ensure faq-local.json exists in the data directory.');
          });
      } else {
        console.error('ERROR: DATA_PATH not set. This site requires offline data to function.');
      }
    },
    toggleMessage (index) {
      this.index_active = index;
    	this.showMessage = !this.showMessage;
    }
   
}
});


