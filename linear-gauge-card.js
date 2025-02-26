class LinearGaugeCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
    }
    this.config = Object.assign({}, config);

    if (!this.config.name) this.config.name = "";
    if (!this.config.fontSize) this.config.fontSize = "15px";
    if (!this.config.barColor) this.config.barColor = "black";
    if (!this.config.barWidth) this.config.barWidth = "1%";
    if (!this.config.unit) this.config.unit = "";
    if (!this.config.dataLabelColor)
      this.config.dataLabelColor = "rgba(145, 145, 145, 0.4)";
    if (!this.config.dataLabelTextColor) this.config.dataLabelTextColor = "white";
    if (!this.config.gridLabelTextColor) this.config.gridLabelTextColor = "white";
    if (!this.config.start) this.config.start = 0;
    if (!this.config.startVisibility) this.config.startVisibility = "hidden";

    // Initialize the content if it's not there yet.
    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <div class="card-content"></div>
        </ha-card>
      `;
      this.content = this.querySelector("ha-card .card-content");
    }

    this.content.innerHTML = `
    <style>
        .cardHeader {
            margin-top: 0;
            margin-bottom: 2em;
            display: block;
        }

        .linearGauge {
            width: 100%;
            margin: 0 auto;
            position: relative;
        }

        .grid-container , .grid-label-container {
            display: grid;
        }

        .grid-item {
            height: 3em;
        }

        .grid-label {
            display: flex;
            justify-content: space-between;
        }

        .grid-label-text {
          color: ${this.config.gridLabelTextColor};
          display: inline-block;
          font-size: ${this.config.fontSize};
          padding-top: 5px;
        }

        .bar {
          height: 3em;
          width: ${this.config.barWidth};
          position: absolute;
          z-index: 2;
          background: ${this.config.barColor};
          transition: left 0.5s ease;
        }

        .dataLabel {
          display: inline-block;
          transform: translate(-44%, -120%);
          margin-bottom: 4%;
          background-color: ${this.config.dataLabelColor};
          font-size: ${this.config.fontSize};
          transition: left 0.5s ease;
          padding: 2px 4px;
          border-radius: 5px;
          font-weight: bold;
          color: ${this.config.dataLabelTextColor};
          white-space: nowrap;
        }

        #grid-label-text-start {
          visibility: ${this.config.startVisibility};
        }
        
        
    </style>
    <div class="linearGauge">
        <h3 class="cardHeader">${this.config.name}</h3>
        <div class="bar"><div class="dataLabel"></div></div>
        <div class="grid-container"></div>
        <div class="grid-label-container"></div>
    </div>
    `;

    let gridContainer = this.querySelector(".grid-container");
    let gridLabelContainer = this.querySelector(".grid-label-container");

    const max = this.config.segments[this.config.segments.length - 1].until - this.config.start;

    let griditemsizes = "";
    for (let i = 0; i < this.config.segments.length; i++) {
      const segment = this.config.segments[i];
      const prevsegment = i === 0 ? segment : this.config.segments[i - 1];

      let newGridItem = document.createElement("div");
      let newGridLabel = document.createElement("div");
      let newText = document.createElement("span");
      let newTextStart = document.createElement("span");

      // First segment
      if (i === 0) {
        newTextStart.textContent = this.config.start;
        newGridItem.style.borderRadius = "5px 0px 0px 5px";
        griditemsizes += `${((segment.until - this.config.start) / max) * 100}% `;
      }

      // Last segment
      else if (i === this.config.segments.length - 1) {
        newGridItem.style.borderRadius = "0px 5px 5px 0px";
        griditemsizes += "auto";
      } else {
        newGridItem.style.borderRadius = "0px 0px 0px 0px";
        griditemsizes += `${((segment.until - prevsegment.until) / max) * 100
          }% `;
      }

      newGridItem.className = "grid-item";
      newGridItem.style.backgroundColor = segment.color;

      newGridLabel.className = "grid-label";
      newText.className = "grid-label-text";
      newText.id = "grid-label-text-" + i;
      newText.textContent = segment.until;

      newTextStart.className = "grid-label-text";
      newTextStart.id = "grid-label-text-start";

      gridContainer.appendChild(newGridItem);
      gridLabelContainer.appendChild(newGridLabel);
      newGridLabel.appendChild(newTextStart);
      newGridLabel.appendChild(newText);
    }

    gridContainer.style.gridTemplateColumns = griditemsizes;
    gridLabelContainer.style.gridTemplateColumns = griditemsizes;

    this.querySelector("ha-card").addEventListener("click", () => {
      this._moreinfo(this.config.entity);
    });
  }

  set hass(hass) {
    const entityId = this.config.entity;
    const state = hass.states[entityId];
    const stateStr = isNaN(parseFloat(state.state)) ? "NaN" : state.state;
    const friendlyName = state.attributes.friendly_name || entityId;
    let cardHeader = this.querySelector(".cardHeader");

    let bar = this.querySelector(".bar");
    let dataLabel = this.querySelector(".dataLabel");
    let barWidth = parseFloat(this.config.barWidth.replace("%", ""));

    cardHeader.textContent = this.config.name ? this.config.name : friendlyName;

    if (stateStr <= this.config.start) {
      bar.style.left = `${0}% `;
      bar.style.borderRadius = "5px 0px 0px 5px";
    } else if (stateStr >= this.config.segments[this.config.segments.length - 1].until) {
      bar.style.left = `${100}% `;
      bar.style.borderRadius = "0px 5px 5px 0px";
    } else {
      bar.style.left = `${(stateStr - this.config.start) /
        (this.config.segments[this.config.segments.length - 1].until - 
        this.config.start) * 100 - (barWidth / 2)}% `;
      bar.style.borderRadius = "0px 0px 0px 0px";
    }

    dataLabel.textContent = `${stateStr}${this.config.unit ? ' ' + this.config.unit : ''}`;
  }

  getCardSize() {
    return 3;
  }

  _moreinfo(entityinfo) {
    const popupEvent = new Event("hass-more-info", {
      bubbles: true,
      cancelable: false,
      composed: true,
    });
    popupEvent.detail = { entityId: entityinfo };
    document.querySelector("home-assistant").dispatchEvent(popupEvent);
  }
}
customElements.define("linear-gauge-card", LinearGaugeCard);
