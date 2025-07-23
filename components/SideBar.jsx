import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemText, Divider, TextField, Grid, Button } from '@mui/material';

const Sidebar = ({ side = "left", onWallCreate, modelLoad }) => {
  const [width, setWidth] = useState('20');
  const [height, setHeight] = useState('10');
  const [depth, setDepth] = useState('2');

  const handleCreateWall = () => {
    const wallData = { width, height, depth };
    onWallCreate(wallData);
  };

  const handleModelPath = (url) => {
    console.log(url);
    modelLoad(url);
  };

  return (
    <Drawer
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          position: 'absolute',
          borderRight: '1px solid #ddd',
        },
      }}
      variant="permanent"
      anchor={side}
    >
      {side === "left" && (
        <List>
          <ListItem>
            <ListItemText primary="Models" />
          </ListItem>
          <Divider />
          <ListItem button="true" onClick={() => handleModelPath('../public/door.glb')}>
            <ListItemText primary="Door" />
          </ListItem>
          <ListItem button="true" onClick={() => handleModelPath('../public/old_sofa.glb')}>
            <ListItemText primary="Sofa" />
          </ListItem>
          <ListItem button="true" onClick={() => handleModelPath('../public/table.glb')}>
            <ListItemText primary="Table" />
          </ListItem>
          <ListItem button="true" onClick={() => handleModelPath('../public/suzanne.glb')}>
            <ListItemText primary="Suzanne" />
          </ListItem>
        </List>
      )}

      {side === "right" && (
        <div style={{ padding: '16px' }}>
          <h3 style={{ padding: '10px' }} >Enter Wall Dimensions</h3>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                label="Width"
                variant="outlined"
                fullWidth
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Height"
                variant="outlined"
                fullWidth
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Depth"
                variant="outlined"
                fullWidth
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
              />
            </Grid>
            <Button
              variant="contained"
              onClick={handleCreateWall}
            >
              Create Wall
            </Button>
          </Grid>
        </div>
      )}
    </Drawer>
  );
};

export default Sidebar;
