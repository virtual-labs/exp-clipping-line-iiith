When a 2D image is displayed onto a display screen, often the display area occupies a fraction of the amount of space that covers the entire image area. Thus the unnecessary parts of the image that are located outside the display area can be removed to reduce the exorbitant amount of computations involved to render them. This technique to remove such inessential parts of a scene lying outside the display area is called **clipping**. The display area is also called the **clipped window**.  

The technique used to cut/clip the parts of the line belonging in the region, outside of the clipped window, is called **line clipping**.  

Some common algorithms to perform line clipping are as follows:  

  a. Cohen-Sutherland algorithm  
  b. Liang-Barsky algorithm  
  c. Nicholl-Lee-Nicholl algorithm  

Here we have discussed only the Cohen-Sutherland Line Clipping algorithm.    
