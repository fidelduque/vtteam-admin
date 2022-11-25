import { Text, Flex, PhoneNumberField, Table, TableHead, TableRow, TableCell, TableBody, Heading, TextField, Grid, SwitchField, Button } from "@aws-amplify/ui-react";
import { Amplify, API } from "aws-amplify";
import { useEffect, useState } from "react";

export function  Brands() {
  const [brandName, setBrandName] = useState("");
  const [isOpen, setBrandOpen] = useState(true);
  const [hasContactLens, setContactLens] = useState(true);
  const [phoneNumber, setPhone] = useState("");
  const [dialCode, setDialCode] = useState("+1")

  const brandNameBlur = (evt : any) => {
    setBrandName(evt.target.value);
  }
const [brands, setBrands] = useState([]);
  
  const getBrands = async () =>  {
    await API.get('api96b4df43','/brands',{}).then((data) =>
    {
        if (data) {
            console.log(data);
            setBrands(data.data);
        }

    });        
}

useEffect(() => {
  getBrands();
},[]);

const saveBrand = async() => {

  await API.put('api96b4df43','/brands',{body: {type: 'brand', key: phoneNumber, name: brandName, contactlens: hasContactLens, open: isOpen} });
  getBrands();
}
const deleteItem = async(item: any) =>{
  console.log(item)
        await API.del('api96b4df43',`/brands/brand/${item.key}`,{key: item.key}).then(response =>{
          console.log(response);
          getBrands();

        })

};

const editItem = async(item: any) =>{
  setPhone(item.key);
  setBrandName(item.name);
  setBrandOpen(item.open);
  setContactLens(item.contactlens);

};


const changePhoneNumber = (e: any) => {
  console.log(e);
  setPhone(e.target.value);

}
    return  <>
    <div id="BrandContent">
    <Flex justifyContent={"center"}>
        <Heading level={2}>Brand Settings</Heading>
    </Flex>
    <div id="BrandTopContent">
    <Grid templateColumns={"0.8fr 0.8fr 0.3fr 0.3fr 0.3fr"} columnGap="small" >

        <TextField
                    variation="quiet"
                    placeholder="+12345678901"
                    label="Brand phone"
                    
                    errorMessage="There is an error"
                    onChange={changePhoneNumber}
                    value={phoneNumber}
                    />
                    <TextField
                    variation="quiet"
                    placeholder="Brand name"
                    label="Brand Name"
                    
                    errorMessage="There is an error"
                    onChange={brandNameBlur}
                    value={brandName}
                    />

<SwitchField
  isDisabled={false}
  label="Open"
  labelPosition="start"
  isChecked={isOpen}
  id="OpenSwitch"
  onChange={(e) => {
    setBrandOpen(e.target.checked);
  }}
/>

<SwitchField
  isDisabled={false}
  label="Contact Lens"
  labelPosition="start"
  isChecked={hasContactLens}
  onChange={(e) => {
    setContactLens(e.target.checked);
  }}
/>
<Button variation="primary" alignSelf="end" onClick={saveBrand}>Save Brand</Button>

    </Grid>
    </div>

        

    <Table
            caption=""
            highlightOnHover={true}
            variation="striped">
            <TableHead>
                <TableRow>
                    <TableCell as="th">Phone Number</TableCell>
                    <TableCell as="th">Brand</TableCell>
                    {/* <TableCell as="th">Edit</TableCell> */}
                    <TableCell as="th">Contact Lens</TableCell>
                    <TableCell as="th">Open</TableCell>
                    <TableCell as="th">Edit</TableCell>
                    <TableCell as="th">Delete</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                    {brands.map((item, i) => (
                        <>
                <TableRow>
                  <TableCell>
                    {
//@ts-ignore    
                    item.key}
                  </TableCell>
                <TableCell>
                    {
//@ts-ignore                        
                    item.name}
                </TableCell>
                <TableCell>
                {<SwitchField
  isDisabled={false}
  label="Contact lens"
  labelPosition="start"
  //@ts-ignore
  isChecked={item.contactlens}
/> } 
                </TableCell>
                <TableCell>
                {<SwitchField
  isDisabled={false}
  label="Open"
  labelPosition="start"
  //@ts-ignore
  isChecked={item.open}
/> }                 </TableCell>
<TableCell>
  <Button onClick={()=> editItem(item)}>Edit
  </Button>
</TableCell>
                <TableCell>
                    <Button onClick={() => deleteItem(item)}>
                        Delete
                    </Button>
                </TableCell>
            </TableRow>
                </>
                ))}
        </TableBody>
    </Table>
  
    </div>
    </>;
} 

export default Brands;