import { Button, Flex, Grid, Heading, SwitchField, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";
import { Amplify, API } from "aws-amplify";

export function General() {

    const [prompts, setPrompts] = useState([]); 
    const [promptName, setPromptName] = useState("");
    const [promptText, setPromptText] = useState("");
    const [isCompanyOpen, setCompanyOpen] = useState(true);

    const promptNameBlur = (e: any) => {
        setPromptName(e.target.value);
    }

    const promptTextBlur = (e: any) => {
        setPromptText(e.target.value)
    }

    const savePrompt = async() => {
        await API.put('api96b4df43','/prompts',{body: {type: 'prompt', key: promptName, prompt: promptText} });
        getPrompts();
        setPromptName('');
        setPromptText('');
    }

    const editItem = (item: any) => {
        setPromptName(item.key);
        setPromptText(item.prompt);
    }

    const getPrompts = async () =>  {
        await API.get('api96b4df43','/prompts',{}).then((data) =>
        {
            if (data) {
                console.log(data);
                setPrompts(data.data);
            }

        });        
    }

    const deleteItem = async (item : any) => {
        await API.del('api96b4df43',`/prompts/prompt/${item.key}`,{key: item.key}).then(response =>{
            console.log(response);
            getPrompts();
  
          })    };
    
    const getCompanySettings = async () => {
        await API.get('api96b4df43', '/companySettings', {}).then(data =>{
            if (data) {
                console.log(data);
                //setCompanyOpen(data.data.)
            }
        });
    }

    const updateCompany = async () => {
        console.log(isCompanyOpen);
        await API.put('api96b4df43', '/companySettings', {body: {type: 'generalSettings', key: 'open', value: isCompanyOpen}} )
    }

    useEffect(() => {
        getPrompts();
        getCompanySettings();
    },[])



    return <>
    <div id="GeneralContent">
     <Flex justifyContent={"center"}>
     <Heading level={2}>General Settings</Heading>
        </Flex>
        <div id="GeneralEmergency">
        <Heading level={4}>Emergency Close</Heading>
        </div>
        <div>
        <SwitchField
            isDisabled={false}
            label="Open"
            labelPosition="start"
            isChecked={isCompanyOpen}
            
            onChange={(e) => {
                setCompanyOpen(e.target.checked);
                updateCompany();
            }}
            />
        </div>
        <div id="GeneralPrompts">
            <Heading level={4}>Prompts</Heading>
        </div>
        <Grid templateColumns={"1fr 1.9fr 1fr"} columnGap="small" >
            <div>
                <label>
                    Prompt Name
                </label>
                <TextField
                    variation="quiet"
                    placeholder="Prompt name"
                    label="promptname"
                    labelHidden
                    errorMessage="There is an error"
                    onChange={promptNameBlur}
                    value={promptName}
                    />
            
            </div>
            <div>
                <label>
                    Prompt Text
                </label>
                <TextField
                    variation="quiet"
                    placeholder="Prompt text"
                    label="prompttext"
                    labelHidden
                    errorMessage="There is an error"
                    onChange={promptTextBlur}
                    value={promptText}
                    />
            
            </div>
            <div>
                <Button variation="primary" alignSelf="end" onClick={savePrompt}>Save Prompt</Button>

            </div>
        </Grid>
     <Grid>

        <div>
        <Table
            caption=""
            highlightOnHover={true}
            variation="striped">
            <TableHead>
                <TableRow>
                <TableCell as="th">Prompt Key</TableCell>
                    <TableCell as="th">Prompt text</TableCell>
                    <TableCell as="th">Edit</TableCell>
                    <TableCell as="th">Delete</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                    {prompts.map((item, i) => (
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
                    item.prompt}
                </TableCell>
                <TableCell>
                    <Button onClick={() => editItem(item)}>
                        Edit
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
    </Grid>
    </div>
    </>;
} 

