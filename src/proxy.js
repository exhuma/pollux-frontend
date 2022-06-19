export class Proxy {
  constructor(url, token) {
    this.url = url;
    this.token = token;
    this.upload_url = url + "/upload";
  }

  fetchGenera() {
    return fetch(`${this.url}/genera`).then((response) => {
      return response.json();
    });
  }

  getRecent(genus) {
    let url = `${this.url}/recent?num_days=365&genus=${genus}`;
    return fetch(url, {
      headers: {
        Accept: "application/prs.plotlydict+json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return data[genus];
      });
  }

  getRecentRaw() {
    let url = `${this.url}/recent?num_days=5`;
    return fetch(url, {
      headers: {
        Accept: "application/json",
      },
    }).then((response) => {
      return response.json();
    });
  }

  getBetween(genus, from, to) {
    let fromStr = from.toFormat("yyyy-MM-dd");
    let toStr = to.toFormat("yyyy-MM-dd");
    let url = `${this.url}/between/${fromStr}/${toStr}?genus=${genus}`;
    return fetch(url, {
      headers: {
        Accept: "application/prs.plotlydict+json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return data[genus];
      });
  }

  getHeatmap(genus) {
    let url = `${this.url}/heatmap/${genus}`;
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // JSON does not support NaN values. The backend return NaNs as -1.
        // Here we convert these back to proper NaN values so Plotly can
        // display them accordingly
        let tmp = [];
        data.z.forEach((row) => {
          let mapped = row.map((cell) => {
            return cell === -1 ? NaN : cell;
          });
          tmp.push(mapped);
        });
        data.z = tmp;
        return data;
      });
  }

  getSupportedLanguages() {
    return new Promise((resolve) => {
      // TODO: placeholder. The languages are provided by the data from
      // pollen.lu and only the back-end knows about this. We need to fetch
      // these from the BE
      resolve([
        { key: "en", displayName: "English" },
        { key: "de", displayName: "Deutsch" },
        { key: "lb", displayName: "Lëtzebuergesch" },
        { key: "fr", displayName: "Français" },
      ]);
    });
  }

  login(username, password) {
    let url = `${this.url}/auth`;
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return data.token;
      });
  }

  setToken(token) {
    this.token = token;
  }

  upload(file) {
    let url = `${this.url}/upload`;
    return fetch(url, {
      headers: {
        Authorization: `JWT ${this.token}`,
      },
      data: file, // TODO
    }).then((response) => {
      if (response.status === 401) {
        throw new Error("Authorization failed");
      }
      return response.json();
    });
  }
}
