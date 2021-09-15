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
      pressData: [],
      faqData:[],
      showMessage: true,
      index_active:0,
      alertData: [],
      apiURL: 'https://directus.thegovlab.com/odpl-incubator',
    }
  },

  created: function created() {
    this.fetchAlerts();
    this.fetchMentor();
    this.fetchPress();
    this.toggleMessage();
    this.fetchQuestions();
  },


  methods: {
    fetchPress() {
      self = this;
      const client = new DirectusSDK({
        url: "https://directus.thegovlab.com/",
        project: "odpl-incubator",
        storage: window.localStorage
      });

      client.getItems(
  'news',
  {
    fields: ['*.*']
  }
).then(data => {
  self.pressData = data.data;

})

.catch(error => console.error(error));
    },
    fetchAlerts() {
      self = this;
      const client = new DirectusSDK({
        url: "https://directus.thegovlab.com/",
        project: "odpl-incubator",
        storage: window.localStorage
      });

      client.getItems(
  'alert_banner',
  {
    fields: ['*.*']
  }
).then(data => {
  self.alertData = data.data;

})

.catch(error => console.error(error));
    },
    fetchMentor() {
      self = this;
      const client = new DirectusSDK({
        url: "https://directus.thegovlab.com/",
        project: "odpl-incubator",
        storage: window.localStorage
      });

      client.getItems(
  'mentors',
  {
    sort: "-last_name",
    fields: ['*.*']
  }
).then(data => {

  console.log(data)
  self.mentorData = data.data;
})

.catch(error => console.error(error));
    },
    fetchQuestions() {
      self = this;
      const client = new DirectusSDK({
        url: "https://directus.thegovlab.com/",
        project: "odpl-incubator",
        storage: window.localStorage
      });

      client.getItems(
  'faq',
  {
    fields: ['*.*']
  }
).then(data => {
  console.log(data)
  self.faqData = data.data;
})
.catch(error => console.error(error));
    },
    toggleMessage (index) {
      this.index_active = index;
    	this.showMessage = !this.showMessage
    }
   
}
});


