public class demoNgForce1Page {
	 @RemoteAction
    public static String init()
	{
		return JSON.serialize(getSobjectFields());
	}
	private static map<String,Schema.DescribeSObjectResult> getSobjectFields()
	{
		map<String,Schema.DescribeSObjectResult> oName2DSR = new map<String,Schema.DescribeSObjectResult>();
		List<String> sObjectTypes = new list<String>(Schema.getGlobalDescribe().keySet());
		List<Schema.DescribeSObjectResult> DSRs  = schema.describeSObjects(sObjectTypes);
		for(Schema.DescribeSObjectResult DSR:DSRs)
		{
			oName2DSR.put(DSR.getName(),DSR);
		}
		return oName2DSR;
	}
}