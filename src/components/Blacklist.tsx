import { Text, Flex, PhoneNumberField, Table, TableHead, TableRow, TableCell, TableBody, SelectField, Button, Heading, Grid, Alert, TextField } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";
import Select from 'react-select'
import AsyncSelect from 'react-select/async';
import { Amplify, API } from "aws-amplify";


export function Blacklist() {
    const options = [
        { value: 'Chevy', label: 'Chevy' },
        { value: 'Jeep', label: 'Jeep' },
        { value: 'All', label: 'All' }
    ];

    const [phoneNumber, setPhone] = useState("");
    const [seletedBrands, setSelectedBrands] = useState("");
    const [blacklistedNumbers, setBlacklistedNumbers] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const blockNumber = async () => {
        let brands = seletedBrands;
        if(seletedBrands.indexOf('All') !== -1){
            brands = 'all';
        }
        await API.put('api96b4df43','/blacklist',{body: {type: 'blacklist', key: phoneNumber, brand: brands} });
        getBlacklistedNumbers();

    }

    

    const getBlacklistedNumbers = async () =>  {
        await API.get('api96b4df43','/blacklist',{}).then((data) =>
        {
            if (data) {
                console.log(data);
                setBlacklistedNumbers(data.data);
            }

        });        
    }

    const setEditPhone = (item : any) => {
        console.log(item.item.key);
        setPhone(item.key.substring(2));
    }


    

    const selectBrand = (e: any) => {
        let Brands = '';
        e.forEach((element: { label: string; value: string }) => {
            Brands = Brands + ',' + element.label;
        });
        setSelectedBrands(Brands.substring(1));
    }

    const changePhoneNumber = (e: any) => {
        setPhone(e.target.value);
    }

    const deleteItem = async (item: any) => {
        console.log(item)
        await API.del('api96b4df43',`/blacklist/blacklist/${item.key}`,{key: item.key}).then(response =>{
          console.log(response);
          getBlacklistedNumbers();

        })
    }

    useEffect(()=>{
        getBlacklistedNumbers();
    },[]);
    return <>
        <div id="BlacklistContent">

        <Flex justifyContent={"center"}>
            <Heading level={2}>Blacklist Settings</Heading>
        </Flex>
        <Grid templateColumns={"1fr 1fr 1fr"} columnGap="small" >
            <div>
            <TextField
                    variation="quiet"
                    placeholder="+12345678901"
                    label="Brand phone"
                    
                    errorMessage="There is an error"
                    onChange={changePhoneNumber}
                    value={phoneNumber}
                    />
            </div>
            <div>
                <label>
                    Brand
                </label>
                <Select isMulti options={options} onChange={selectBrand} id="BrandSelectList"/>
            </div>
            <div>
                <Button variation="primary" id="BlockNumberButton" onClick={blockNumber}>Block number</Button>

            </div>
        </Grid>


        <Table
            caption=""
            highlightOnHover={true}
            variation="striped">
            <TableHead>
                <TableRow>
                    <TableCell as="th">Phone Number</TableCell>
                    <TableCell as="th">Brand</TableCell>
                    {/* <TableCell as="th">Edit</TableCell> */}
                    <TableCell as="th">Delete</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                    {blacklistedNumbers.map((item, i) => (
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
                    item.brand}
                </TableCell>
                {/* <TableCell>
                    <Button onClick={() => setEditPhone({item})}>
                        Edit
                    </Button>
                </TableCell> */}
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

