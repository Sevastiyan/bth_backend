# Checklist


## IAM 



## Route 56
- Ensure that the Hosted Zone exists on Route56. If not create a new one with desired name. i.e. `wethmfactory.com`




## IOT Core
- Create an IOT Core Policy under `Security/Policies` 

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    }
  ]
}
```

- Ensure ensure that the `policyName` reflects the name in `src/module/mqtt/index.ts` 

```typescript
export function applyCert(thingName: string) {
    // [...]

    // attachPolicy
    await iot
        .attachPolicy({
            policyName: 'myIotPolicy',
            target: certdata.certificateArn,
        })
        .promise()
}
```

- Create Thing Group
  - Create static thing group
  - Add a thing group Name (i.e. `SE_ESP32_REV0-CA`)
  - Copy the generated ARN to `src/environment.ts` under the new created server.

``` javascript
mqtt: {
    endpoint: '',
    thingGroupArn: '', // create Thing Group
    ThingGroupName: '',
},
```

