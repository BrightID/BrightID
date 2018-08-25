const logging = (channel) => {
  console.log(`id ${channel.id}`);
  console.log(`binaryType ${channel.binaryType}`);
  console.log(
    `bufferedAmountLowThreshold ${channel.bufferedAmountLowThreshold}`,
  );
  console.log(`maxPacketLifeTime ${channel.maxPAcketLifeTime}`);
  console.log(`maxRetransmits ${channel.maxRetransmits}`);
  console.log(`negotiated ${channel.negotiated}`);
  console.log(`ordered ${channel.ordered}`);
  console.log(`protocol ${channel.protocol}`);
  console.log(`readyState ${channel.readyState}`);
  channel.onbufferedamountlow = (e) => {
    console.log(`on buffered amount low`);
    console.log(e);
  };
  channel.onerror = (e) => {
    console.log(`channel error`);
    console.log(e);
  };
};

export default logging;
