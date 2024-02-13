# Cohen-Sutherland Line Clipping Algorithm

## Pseudo Code of the Algorithm

**Input:** Two Endpoints of the line, \((x_0, y_0)\) & \((x_1, y_1)\).  
Two opposite corner points of the frame buffer.

## Steps of the Algorithm

1. **Initialize Endpoints:**  
   Set \(P_0 = (x_0, y_0)\) and \(P_1 = (x_1, y_1)\).

2. **Compute 4-bit Codes:**  
   Compute the 4-bit codes for each endpoint based on their relative position to the clipping window. The codes are determined as follows:

  <img  src="images/code-block.png">

   Source: From Academic Tutorials

   The code "0000" represents the clip window, and all other areas outside are to be clipped.

   - If both codes are "0000" (bitwise OR of the codes yields "0000"), the line lies completely inside the window. Pass the endpoints to the draw routine.
   - If both codes have a "1" in the same bit position (bitwise AND of the codes is not "0000"), the line lies outside the window and can be trivially rejected.

3. **Clipping Decision:**  
   If a line cannot be trivially accepted or rejected, it implies that at least one of the two endpoints lies outside the window, and the line segment crosses a window edge. In such cases, the line must be clipped at the window edge before being passed to the drawing routine.

4. **Examine Endpoint Codes:**  
   Examine one of the endpoints, say \(P_0\), and read \(P_0\)'s 4-bit code in order: Left-to-Right, Bottom-to-Top.

5. **Clipping at Window Edge:**  
   When a set bit ("1") is found in the 4-bit code, compute the intersection \(I\) of the corresponding window edge with the line from \(P_0\) to \(P_1\). Replace \(P_0\) with \(I\) and repeat the algorithm.

This algorithm efficiently determines and clips line segments that extend beyond the specified window, ensuring that only the visible portion is considered for rendering.