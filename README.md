# linear-gauge-card

**Options**
| Name | Type | Requirement | Description | Default |
| -------------- | ----------- | ------------ | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type` | string | **Required** | `custom:linear-gauge-card` |
| `entity` | string | **Required** | `sensor.pm2_5_sensor` |
| `segments` | string | **Required** | Specify the color and how long each data segments will be |
| `name` | string | **Optional** | The title of the card | Device Friendly Name |
| `unit` | string | **Optional** | Display unit alongside the data |
| `fontSize` | string | **Optional** | Font size of the data label and marker | 15px
| `barWidth` | string | **Optional** | Width of the pointer bar | 1%
| `dataLabelColor` | string | **Optional** | Adjust color and/or transparency of the data label | rgba(145, 145, 145, 0.4)


**Example**
```yaml
type: custom:linear-gauge-card
entity: sensor.pm2_5_sensor
name: Living Room PM2.5 (µg/m3)
segments:
  - until: 12
    color: '#43a047'
  - until: 35
    color: '#FFC730'
  - until: 55
    color: '#FF8000'
  - until: 100
    color: '#db4437'
```
