export const allowedMoves: { [key: string]: string[] } = {
    'Watchlist': ['Due Diligence', 'Too Expensive', 'Pass For Now', 'Permanent Pass'],
    'Due Diligence': ['Buy Ready', 'Too Expensive', 'Pass For Now', 'Permanent Pass'],
    'Buy Ready': ['Core Holdings', 'Too Expensive', 'Pass For Now', 'Permanent Pass'],
    'Core Holdings': ['Regular Review', 'Sell Ready', 'Too Expensive', 'Pass For Now', 'Permanent Pass'],
    'Regular Review': ['Sell Ready', 'Core Holdings', 'Too Expensive', 'Pass For Now', 'Permanent Pass'],
    'Sell Ready': ['Sold', 'Regular Review', 'Too Expensive', 'Pass For Now', 'Permanent Pass'],
    'Sold': ['Too Expensive', 'Pass For Now', 'Permanent Pass'],
    'Too Expensive': ['Pass For Now', 'Permanent Pass'],
    'Pass For Now': ['Due Diligence', 'Permanent Pass'],
    'Permanent Pass': [] // No transitions out
};