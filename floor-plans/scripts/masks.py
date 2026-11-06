import numpy as np, cv2
from PIL import Image
def k(n, shape=cv2.MORPH_ELLIPSE): return cv2.getStructuringElement(shape,(n,n))
def fill_holes(m, max_area=None):
    m=m.astype(np.uint8)
    inv=1-m
    n,lab,st,_=cv2.connectedComponentsWithStats(inv,connectivity=4)
    out=m.copy()
    H,W=m.shape
    for i in range(1,n):
        x,y,w,h,a=st[i]
        if x==0 or y==0 or x+w>=W or y+h>=H: continue
        if max_area is None or a<=max_area: out[lab==i]=1
    return out
def compute(path):
    w=np.array(Image.open(path).convert('RGB')).astype(np.float32)
    r,g,b=w[...,0],w[...,1],w[...,2]
    gray=w.mean(-1); sat=w.max(-1)-w.min(-1)
    wall=((gray<115)&(sat<28)).astype(np.uint8)
    wall=cv2.morphologyEx(wall,cv2.MORPH_OPEN,k(3,cv2.MORPH_RECT))
    # remove tiny bits
    n,lab,st,_=cv2.connectedComponentsWithStats(wall,8)
    for i in range(1,n):
        if st[i,4]<14: wall[lab==i]=0
    satb=cv2.GaussianBlur(sat,(0,0),2.5); grayb=cv2.GaussianBlur(gray,(0,0),2.0)
    veg=((satb>10)&(grayb<232)).astype(np.uint8)
    veg=cv2.morphologyEx(veg,cv2.MORPH_CLOSE,k(7))
    veg=cv2.morphologyEx(veg,cv2.MORPH_OPEN,k(5))
    veg=fill_holes(veg,120)
    vd=cv2.dilate(veg,k(7))
    n,lab,st,_=cv2.connectedComponentsWithStats(wall,8)
    for i in range(1,n):
        m=lab==i
        if vd[m].mean()>0.5: wall[m]=0
    green=(((g-b)>9)&(sat>11)&(gray<235)).astype(np.uint8)
    green=cv2.medianBlur(green*255,5)//255
    green=cv2.morphologyEx(green,cv2.MORPH_CLOSE,k(7))
    green=cv2.morphologyEx(green,cv2.MORPH_OPEN,k(5))
    green=fill_holes(green,120)
    green=(green|veg).astype(np.uint8)
    green[wall>0]=0
    canopy=((((g-b)>24)|(gray<140))&(satb>9)).astype(np.uint8)&cv2.dilate(green,k(5))
    canopy=cv2.medianBlur(canopy*255,5)//255
    canopy=cv2.morphologyEx(canopy,cv2.MORPH_CLOSE,k(13))
    canopy=cv2.morphologyEx(canopy,cv2.MORPH_OPEN,k(9))
    canopy=fill_holes(canopy,400)
    n,lab,st,_=cv2.connectedComponentsWithStats(canopy,8)
    for i in range(1,n):
        if st[i,4]<120: canopy[lab==i]=0
    return w,gray,sat,wall,green,canopy,veg
if __name__=='__main__':
    import sys
    w,gray,sat,wall,green,canopy,veg=compute(sys.argv[1])
    vis=np.full(w.shape,255,np.uint8)
    vis[green>0]=(170,220,170)
    vis[canopy>0]=(40,120,40)
    vis[wall>0]=(200,0,0)
    Image.fromarray(vis).save(sys.argv[2])
