import GitHub from 'github';
import Promise from 'bluebird';

const libConfig = {
  debug: true,
  protocol: 'https',
  Promise
};

export default new GitHub(libConfig);
