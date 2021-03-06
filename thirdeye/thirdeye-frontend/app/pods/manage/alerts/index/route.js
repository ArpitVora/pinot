import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import fetch from 'fetch';
import { inject as service } from '@ember/service';

export default Route.extend({

  // Make duration service accessible
  durationCache: service('services/duration'),

  model() {
    return hash({
      alerts: fetch('/thirdeye/entity/ANOMALY_FUNCTION').then(res => res.json()),
      subscriberGroups: fetch('/thirdeye/entity/ALERT_CONFIG').then(res => res.json()),
      applications: fetch('/thirdeye/entity/APPLICATION').then(res => res.json())
    });
  },

  setupController(controller, model, transition) {
    const { queryParams } = transition;
    const isSearchModeAll = !queryParams.selectedSearchMode
      || (queryParams.selectedSearchMode === 'All Alerts');
    const filterBlocks = [
      {
        name: 'Quick Filters',
        filterKeys: ['Alerts I subscribe to', 'Alerts I own', 'All alerts']
      },
      {
        name: 'Status',
        filterKeys: ['Active', 'Inactive']
      },
      {
        name: 'Subscription Groups',
        filterKeys: model.subscriberGroups.map(group => group.name)
      },
      {
        name: 'Applications',
        filterKeys: model.applications.map(app => app.application)
      },
      {
        name: 'Owner',
        filterKeys: model.alerts.map(alert => alert.createdBy)
      }
    ];

    // Send filters to controller
    controller.setProperties({
      model,
      filterBlocks
    });

    // Pre-select all alerts if mode is right
    if (isSearchModeAll) {
      controller.setProperties({
        selectedAlerts: model.alerts,
        resultsActive: true
      });
    }
  },

  actions: {
    /**
     * Clear duration cache (time range is reset to default when entering new alert page from index)
     * @method willTransition
     */
    willTransition(transition) {
      this.get('durationCache').resetDuration();
      this.controller.set('isLoading', true);
    },

    /**
     * Once transition is complete, remove loader
     */
    didTransition() {
      this.controller.set('isLoading', false);
    },

    /**
    * Refresh route's model.
    * @method refreshModel
    */
    refreshModel() {
      this.refresh();
    }
  }
});
