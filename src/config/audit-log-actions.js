const _ = require('lodash');

const BASE_PROPS = {
  event_domain: 'strategy-heartbeat',
  source: '/strategy-heartbeat'
};

function getActorDetails(user) {
  return {
    username: user.local.username,
    email: user.local.email
  };
}

module.exports = {
  SUBJECT: 'strategy-heartbeat',
  cloudEvents: {
    putSettingsMine: props => {
      return Object.assign({
        event: 'put',
        actor_group: _.get(props.user, ['tenant_id']),
        actor: props.user._id,
        actor_details: getActorDetails(props.user),
        action_type: 'CU',
        description: 'Update strategy-heartbeat settings.'
      }, BASE_PROPS);
    }
  }
};
