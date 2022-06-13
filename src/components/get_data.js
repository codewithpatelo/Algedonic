import * as api from '@utils/BarometerConnection';


export async function get_users() {
  let result;
  let users;
  const user_list = [];



  try {
    users = await api.get(`user`);
  } catch (err) {
    throw err;
  }

  try {
    if (!users) {
      throw 'Error getting users from database. Please try later.';
    } else if (users) {
      let i;
      for (i = 0; i < users.length; i++) {
        const us = users;
        let u = {};




        u = {
          id: us[i].id,
          name: us[i].name,
          email: us[i].email,

        };

        user_list.push(u);
      }

      result = user_list;
    } else {
      throw 'Error. Database input is not in the appropiate format. Please contact technical support.';
    }
  } catch (err) {
    throw err;
  }

  try {
    if (result) {
      return await result;
    }
    throw 'Error, loading data from the database. Please try later.';
  } catch (err) {
    throw err;
  }
}
